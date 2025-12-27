import gc
import torch
import whisperx
from typing import Optional, Dict, Tuple, Any
from collections import OrderedDict
from app.core.config import (
    MODEL_MAP, DEFAULT_QUALITY, BATCH_SIZE, DEVICE, COMPUTE_TYPE, ALIGN_CACHE_MAX
)
from app.core.logging import get_logger

logger = get_logger("whisperx-services")

# ----------------------------
# Caches (per-process)
# ----------------------------
_loaded_models: Dict[str, Any] = {}
_align_cache: "OrderedDict[str, Tuple[Any, Any]]" = OrderedDict()  # lang -> (align_model, metadata)

def _cuda_cleanup() -> None:
    """Conservative cleanup."""
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

def _model_name_from_quality(quality: Optional[str]) -> str:
    q = (quality or DEFAULT_QUALITY).lower()
    return MODEL_MAP.get(q, MODEL_MAP[DEFAULT_QUALITY])

def get_model(quality: Optional[str]):
    """Load WhisperX model with caching."""
    model_name = _model_name_from_quality(quality)
    if model_name not in _loaded_models:
        logger.info("Loading WhisperX model=%s device=%s compute_type=%s", model_name, DEVICE, COMPUTE_TYPE)
        _loaded_models[model_name] = whisperx.load_model(
            model_name,
            DEVICE,
            compute_type=COMPUTE_TYPE,
        )
    return _loaded_models[model_name]

def get_align(language_code: str):
    """Load/cached alignment model (LRU-capped)."""
    if not language_code:
        raise ValueError("language_code missing; cannot load alignment model")

    # hit
    if language_code in _align_cache:
        _align_cache.move_to_end(language_code)
        return _align_cache[language_code]

    # miss -> load
    logger.info("Loading align model language=%s device=%s", language_code, DEVICE)
    model_a, metadata = whisperx.load_align_model(language_code=language_code, device=DEVICE)
    _align_cache[language_code] = (model_a, metadata)

    # evict oldest
    while len(_align_cache) > ALIGN_CACHE_MAX:
        old_lang, (old_model, _) = _align_cache.popitem(last=False)
        logger.info("Evicting align model language=%s", old_lang)
        try:
            del old_model
        except Exception:
            pass

    return model_a, metadata
