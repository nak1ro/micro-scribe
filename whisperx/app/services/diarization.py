from typing import Optional
from whisperx.diarize import DiarizationPipeline
from app.core.config import ALLOW_DIARIZATION, HF_TOKEN, DIAR_DEVICE
from app.core.logging import get_logger

logger = get_logger("whisperx-services")

_diarize_pipeline: Optional[DiarizationPipeline] = None

def get_diarization_pipeline() -> DiarizationPipeline:
    """Create diarization pipeline lazily. Requires HF_TOKEN."""
    global _diarize_pipeline

    if not ALLOW_DIARIZATION:
        raise RuntimeError("Diarization is disabled on this server.")

    if _diarize_pipeline is None:
        if not HF_TOKEN:
            raise RuntimeError("Diarization requested but HF_TOKEN is not set.")
        logger.info("Initializing diarization pipeline (device=%s)", DIAR_DEVICE)
        _diarize_pipeline = DiarizationPipeline(use_auth_token=HF_TOKEN, device=DIAR_DEVICE)
    return _diarize_pipeline
