import os
import gc
import logging
import tempfile
from typing import Optional, Dict, Tuple, Any, List

import torch
import whisperx
from whisperx.diarize import DiarizationPipeline

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# --- PyTorch Security Fix ---
from omegaconf.listconfig import ListConfig
from omegaconf.nodes import AnyNode
from omegaconf.base import ContainerMetadata, Metadata
from torch.torch_version import TorchVersion
from collections import defaultdict

torch.serialization.add_safe_globals([
    int, float, bool, str, list, dict, tuple, set,

    # omegaconf objects used inside pyannote/lightning checkpoints
    ListConfig, ContainerMetadata, Metadata, AnyNode, TorchVersion,

    # typing / containers sometimes referenced
    Any, defaultdict
])

# ----------------------------
# Logging (production-friendly)
# ----------------------------
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("whisperx-server")

# ----------------------------
# Config via env vars
# ----------------------------
DEVICE = os.getenv("DEVICE", "cuda" if torch.cuda.is_available() else "cpu")
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "4"))
COMPUTE_TYPE = os.getenv("COMPUTE_TYPE", "int8")  # consider "float16" on GPU for speed/accuracy tradeoff
HF_TOKEN = os.getenv("HF_TOKEN")  # DO NOT hard-code this in code
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "200"))

MODEL_MAP = {
    "fast": "small",
    "balanced": "medium",
    "accurate": "large-v2",
}
DEFAULT_QUALITY = os.getenv("DEFAULT_QUALITY", "balanced")

# ----------------------------
# Response Models
# ----------------------------
class SegmentResponse(BaseModel):
    text: str
    startSeconds: float
    endSeconds: float
    speaker: Optional[str] = None

class TranscriptionResponse(BaseModel):
    fullTranscript: str
    detectedLanguage: Optional[str] = None
    segments: List[SegmentResponse]
    chapters: List[Any] = Field(default_factory=list)  # avoid mutable default

# ----------------------------
# App
# ----------------------------
app = FastAPI(title="WhisperX Server", version="1.0.0")

# ----------------------------
# Caches
# ----------------------------
_loaded_models: Dict[str, Any] = {}
_align_cache: Dict[str, Tuple[Any, Any]] = {}  # language_code -> (align_model, metadata)
_diarize_pipeline: Optional[DiarizationPipeline] = None


def _cuda_cleanup() -> None:
    """Be conservative: only empty cache if CUDA is actually present."""
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()


def get_model(quality: str):
    """Load WhisperX model based on quality, with caching."""
    model_name = MODEL_MAP.get((quality or DEFAULT_QUALITY).lower(), MODEL_MAP[DEFAULT_QUALITY])
    if model_name not in _loaded_models:
        logger.info("Loading WhisperX model: %s (compute=%s, device=%s)", model_name, COMPUTE_TYPE, DEVICE)
        _loaded_models[model_name] = whisperx.load_model(model_name, DEVICE, compute_type=COMPUTE_TYPE)
    return _loaded_models[model_name]


def get_align(language_code: str):
    """Cache alignment model per detected language to avoid reloading each request."""
    if not language_code:
        raise ValueError("language_code is missing; cannot load alignment model")

    if language_code not in _align_cache:
        logger.info("Loading align model for language=%s", language_code)
        model_a, metadata = whisperx.load_align_model(language_code=language_code, device=DEVICE)
        _align_cache[language_code] = (model_a, metadata)

    return _align_cache[language_code]


def get_diarization_pipeline() -> DiarizationPipeline:
    """Create diarization pipeline lazily. Requires HF_TOKEN."""
    global _diarize_pipeline
    if _diarize_pipeline is None:
        if not HF_TOKEN:
            raise RuntimeError("Diarization requested but HF_TOKEN is not set.")
        logger.info("Initializing diarization pipeline (device=%s)", DEVICE)
        _diarize_pipeline = DiarizationPipeline(use_auth_token=HF_TOKEN, device=DEVICE)
    return _diarize_pipeline


# Preload default model on startup (optional but reduces first-request latency)
@app.on_event("startup")
def _startup():
    logger.info("Starting WhisperX Server (device=%s)", DEVICE)
    get_model(DEFAULT_QUALITY)


@app.get("/health")
def health():
    return {"status": "ok", "device": DEVICE, "cuda": torch.cuda.is_available()}


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc: Exception):
    # Avoid leaking secrets or internals; log details server-side.
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_endpoint(
    file: UploadFile = File(...),
    language: Optional[str] = Form(None),           # None = auto-detect
    quality: str = Form(DEFAULT_QUALITY),           # fast, balanced, accurate
    enable_diarization: bool = Form(False),
):
    # Basic upload size guard (not perfect, but prevents obvious abuse)
    content_length = file.headers.get("content-length")
    if content_length and int(content_length) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File too large (max {MAX_UPLOAD_MB} MB)")

    # Save to a safe temp file
    suffix = os.path.splitext(file.filename or "")[1]
    tmp_file_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp_file_path = tmp.name
            data = await file.read()
            if len(data) > MAX_UPLOAD_MB * 1024 * 1024:
                raise HTTPException(status_code=413, detail=f"File too large (max {MAX_UPLOAD_MB} MB)")
            tmp.write(data)

        audio = whisperx.load_audio(tmp_file_path)
        model = get_model(quality)

        # --- STEP 1: Transcribe ---
        logger.info("Transcribing (quality=%s, language=%s)", quality, language or "auto")
        transcribe_options = {"batch_size": BATCH_SIZE}
        if language:
            transcribe_options["language"] = language

        result = model.transcribe(audio, **transcribe_options)
        detected_language = result.get("language")

        _cuda_cleanup()

        # --- STEP 2: Align ---
        logger.info("Aligning (detected_language=%s)", detected_language)
        model_a, metadata = get_align(detected_language)
        aligned = whisperx.align(
            result["segments"],
            model_a,
            metadata,
            audio,
            DEVICE,
            return_char_alignments=False,
        )

        _cuda_cleanup()

        # --- STEP 3: Diarize ---
        if enable_diarization:
            logger.info("Diarizing (speaker ID)")
            diarize_model = get_diarization_pipeline()
            diarize_segments = diarize_model(audio)
            aligned = whisperx.assign_word_speakers(diarize_segments, aligned)
            _cuda_cleanup()

        # --- Transform response ---
        segments: List[SegmentResponse] = []
        full_transcript_parts: List[str] = []

        for seg in aligned.get("segments", []):
            text = (seg.get("text") or "").strip()
            if text:
                full_transcript_parts.append(text)

            segments.append(
                SegmentResponse(
                    text=text,
                    startSeconds=float(seg.get("start") or 0.0),
                    endSeconds=float(seg.get("end") or 0.0),
                    speaker=seg.get("speaker") if enable_diarization else None,
                )
            )

        return TranscriptionResponse(
            fullTranscript=" ".join(full_transcript_parts),
            detectedLanguage=detected_language,
            segments=segments,
            chapters=[],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Transcription failed: %s", e)
        raise HTTPException(status_code=500, detail="Transcription failed")
    finally:
        if tmp_file_path and os.path.exists(tmp_file_path):
            try:
                os.remove(tmp_file_path)
            except OSError:
                logger.warning("Failed to remove temp file: %s", tmp_file_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
