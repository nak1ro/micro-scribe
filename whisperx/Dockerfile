FROM nvidia/cuda:12.8.0-cudnn-runtime-ubuntu24.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000

# System deps:
# - ffmpeg: audio decoding
# - libsndfile1: avoids runtime errors with soundfile/librosa
# - ca-certificates: TLS for model downloads
# - python3-venv: required for PEP 668 compliance
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv ffmpeg git libsndfile1 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment (PEP 668 compliant)
ENV VENV_PATH=/opt/venv
RUN python3 -m venv $VENV_PATH
ENV PATH="$VENV_PATH/bin:$PATH"

WORKDIR /app

# Install Python deps first (better layer caching)
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && \
    pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu124 && \
    pip install -r /app/requirements.txt --extra-index-url https://download.pytorch.org/whl/cu124 && \
    pip install "numpy==1.26.4"

# Copy app
COPY . /app

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Optional: container healthcheck (assumes your /health exists)
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health').read()" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
