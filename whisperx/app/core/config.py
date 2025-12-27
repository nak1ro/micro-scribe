import os
import torch

# ----------------------------
# Config via env vars
# ----------------------------
DEVICE = os.getenv("DEVICE", "cuda" if torch.cuda.is_available() else "cpu")

# Default compute_type: float16 on GPU, int8 on CPU (override via env)
_default_compute = "float16" if DEVICE == "cuda" else "int8"
COMPUTE_TYPE = os.getenv("COMPUTE_TYPE", _default_compute)

BATCH_SIZE = int(os.getenv("BATCH_SIZE", "4"))
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "200"))
MAX_BYTES = MAX_UPLOAD_MB * 1024 * 1024

# GPU safety: limit concurrent requests doing GPU work (usually 1 per GPU)
MAX_CONCURRENT = int(os.getenv("MAX_CONCURRENT", "1"))

HF_TOKEN = os.getenv("HF_TOKEN")  # for diarization pipeline

# Cap alignment cache to avoid runaway memory usage if many languages appear
ALIGN_CACHE_MAX = int(os.getenv("ALIGN_CACHE_MAX", "4"))

# Model “quality” mapping
MODEL_MAP = {
    "fast": "small",
    "balanced": "medium",
    "accurate": "large-v2",
}
DEFAULT_QUALITY = os.getenv("DEFAULT_QUALITY", "balanced").lower()

# Optional: enable/disable diarization entirely (useful if you have no HF token)
ALLOW_DIARIZATION = os.getenv("ALLOW_DIARIZATION", "true").lower() in ("1", "true", "yes")

# Optional: if you want to force diarization device to cpu (some setups do this)
DIAR_DEVICE = os.getenv("DIAR_DEVICE", DEVICE)

# ----------------------------
# Production / Security Config
# ----------------------------
API_KEY = os.getenv("API_KEY")  # If None, auth disabled (or enable by default? up to logic)
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
MAX_AUDIO_DURATION = float(os.getenv("MAX_AUDIO_DURATION", "3600"))  # seconds
TIMEOUT_SECONDS = float(os.getenv("TIMEOUT_SECONDS", "300"))
