import os
import time
import uuid
import uuid
import torch
import asyncio
import whisperx
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse

from app.core.config import (
    DEVICE, COMPUTE_TYPE, BATCH_SIZE, MAX_CONCURRENT,
    DEFAULT_QUALITY, ALLOW_DIARIZATION, ALIGN_CACHE_MAX, HF_TOKEN,
    API_KEY, TIMEOUT_SECONDS, MAX_AUDIO_DURATION
)
from app.core.logging import get_logger
from app.core.security import validate_api_key
from app.schemas import TranscriptionResponse, SegmentResponse
from app.services.model_manager import get_model, get_align, _cuda_cleanup
from app.services.audio import save_upload_to_tempfile, get_audio_duration
from app.services.diarization import get_diarization_pipeline

router = APIRouter()
logger = get_logger("whisperx-endpoints")

# GPU safety: limit concurrent requests doing GPU work (usually 1 per GPU)
_gpu_semaphore = asyncio.Semaphore(MAX_CONCURRENT)

def _build_response(aligned: dict, enable_diarization: bool) -> TranscriptionResponse:
    segments = []
    full_parts = []

    for seg in aligned.get("segments", []):
        text = (seg.get("text") or "").strip()
        if text:
            full_parts.append(text)

        segments.append(
            SegmentResponse(
                text=text,
                startSeconds=float(seg.get("start") or 0.0),
                endSeconds=float(seg.get("end") or 0.0),
                speaker=seg.get("speaker") if enable_diarization else None,
            )
        )

    return TranscriptionResponse(
        fullTranscript=" ".join(full_parts),
        detectedLanguage=aligned.get("language"),
        segments=segments,
        chapters=[],
    )

@router.get("/health")
def health():
    return {
        "status": "ok",
        "device": DEVICE,
        "cuda": torch.cuda.is_available(),
        "max_concurrent": MAX_CONCURRENT,
        "diarization_enabled": ALLOW_DIARIZATION and bool(HF_TOKEN),
        "auth_enabled": bool(API_KEY),
    }

@router.post("/transcribe", response_model=TranscriptionResponse, dependencies=[Depends(validate_api_key)])
async def transcribe_endpoint(
    file: UploadFile = File(...),
    language: Optional[str] = Form(None),              # None = auto-detect
    quality: str = Form(DEFAULT_QUALITY),              # fast, balanced, accurate
    enable_diarization: bool = Form(False),
):
    req_id = str(uuid.uuid4())[:8]
    t0 = time.time()
    tmp_path: Optional[str] = None

    logger.info("[%s] === REQUEST RECEIVED === filename=%s language=%s quality=%s diarize=%s", 
                req_id, file.filename, language, quality, enable_diarization)

    # Limit GPU concurrency (prevents OOM / thrash)
    async with _gpu_semaphore:
        try:
            logger.info("[%s] Saving upload to tempfile...", req_id)
            tmp_path = await save_upload_to_tempfile(file)
            logger.info("[%s] File saved to: %s", req_id, tmp_path)

            # Check duration - fail fast (but after upload, alas)
            logger.info("[%s] Getting audio duration...", req_id)
            duration = await get_audio_duration(tmp_path)
            logger.info("[%s] Audio duration: %.1fs", req_id, duration)
            
            if duration > MAX_AUDIO_DURATION:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Audio duration {duration:.1f}s exceeds limit of {MAX_AUDIO_DURATION}s"
                )

            # Define the heavy lifting as a coro
            async def _process():
                # Load audio (CPU)
                logger.info("[%s] Loading audio with whisperx...", req_id)
                audio = whisperx.load_audio(tmp_path)
                logger.info("[%s] Audio loaded, shape=%s", req_id, audio.shape if hasattr(audio, 'shape') else 'unknown')

                # Inference mode reduces overhead + helps memory
                # Note: We can't strictly async/await inside torch.inference_mode context 
                # unless we are careful. But load_model etc are blocking anyway.
                # Ideally run_in_executor if we want true async, but GPU ops block CUDA stream anyway.
                # For simplicity in this stack, we stick to sync calls inside this block.
                
                with torch.inference_mode():
                    model = get_model(quality)

                    # STEP 1: Transcribe
                    if torch.cuda.is_available():
                         mem = torch.cuda.memory_allocated() / 1024**2
                         logger.info("[%s] GPU Mem before transcribe: %.2f MB", req_id, mem)

                    logger.info("[%s] Transcribing quality=%s language=%s duration=%.1fs", req_id, quality, language or "auto", duration)
                    transcribe_options = {"batch_size": BATCH_SIZE}
                    if language:
                        transcribe_options["language"] = language

                    result = model.transcribe(audio, **transcribe_options)
                    detected_language = result.get("language")
                    logger.info("[%s] Transcription complete. Language detected: %s", req_id, detected_language)

                    # STEP 2: Align
                    if torch.cuda.is_available():
                         mem = torch.cuda.memory_allocated() / 1024**2
                         logger.info("[%s] GPU Mem before align: %.2f MB", req_id, mem)

                    logger.info("[%s] Aligning detected_language=%s", req_id, detected_language)
                    model_a, metadata = get_align(detected_language)

                    aligned = whisperx.align(
                        result["segments"],
                        model_a,
                        metadata,
                        audio,
                        DEVICE,
                        return_char_alignments=False,
                    )
                    aligned["language"] = detected_language
                    logger.info("[%s] Alignment complete", req_id)

                    # STEP 3: Diarize (optional)
                    if enable_diarization:
                        if torch.cuda.is_available():
                             mem = torch.cuda.memory_allocated() / 1024**2
                             logger.info("[%s] GPU Mem before diarize: %.2f MB", req_id, mem)

                        if not ALLOW_DIARIZATION:
                            raise HTTPException(status_code=400, detail="Diarization disabled on server.")
                        logger.info("[%s] Diarizing", req_id)
                        diarize_model = get_diarization_pipeline()
                        diarize_segments = diarize_model(audio)
                        aligned = whisperx.assign_word_speakers(diarize_segments, aligned)
                        # Re-attach language if lost
                        aligned["language"] = detected_language
                        logger.info("[%s] Diarization complete", req_id)

                return _build_response(aligned, enable_diarization)

            # Run with timeout
            resp = await asyncio.wait_for(_process(), timeout=TIMEOUT_SECONDS)

            logger.info("[%s] Done in %.2fs (segments=%d)", req_id, time.time() - t0, len(resp.segments))
            return resp

        except asyncio.TimeoutError:
            logger.error("[%s] Request timed out after %.1fs", req_id, TIMEOUT_SECONDS)
            raise HTTPException(status_code=504, detail="Processing timed out")

        except HTTPException:
            raise
        except torch.cuda.OutOfMemoryError:
            logger.exception("[%s] CUDA OOM during transcription", req_id)
            _cuda_cleanup()
            raise HTTPException(status_code=503, detail="GPU out of memory. Try again later.")
        except Exception as e:
            logger.exception("[%s] Transcription failed: %s", req_id, e)
            raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
        finally:
            # Cleanup temp file
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except OSError:
                    logger.warning("[%s] Failed to remove temp file: %s", req_id, tmp_path)

            # Single cleanup at end of request
            _cuda_cleanup()
