FROM nvidia/cuda:12.6.1-cudnn-runtime-ubuntu24.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000 \
    VENV_PATH=/opt/venv

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-venv \
    python3-pip \
    ffmpeg \
    git \
    libsndfile1 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment (PEP 668 compliant)
RUN python3 -m venv $VENV_PATH

# Make venv the default Python
ENV PATH="$VENV_PATH/bin:$PATH"

WORKDIR /app

# Install Python deps inside venv
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy app code
COPY . /app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
