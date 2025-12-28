import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def verify_setup():
    logger.info("Starting setup verification...")
    
    # 1. Check Python version
    logger.info(f"Python version: {sys.version}")
    
    # 2. Check basic imports and versions
    try:
        import numpy as np
        logger.info(f"Numpy version: {np.__version__}")
        if np.__version__.startswith("2"):
            logger.warning("WARNING: Numpy 2.x detected. This is known to cause crashes with current Pyannote/WhisperX versions.")
    except ImportError as e:
        logger.error(f"Failed to import numpy: {e}")
        return

    try:
        import torch
        logger.info(f"PyTorch version: {torch.__version__}")
        logger.info(f"CUDA available: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            logger.info(f"CUDA device: {torch.cuda.get_device_name(0)}")
    except ImportError as e:
        logger.error(f"Failed to import torch: {e}")
        return

    # 3. Check WhisperX and Pyannote imports (The usual crash points)
    import importlib.metadata
    try:
        import whisperx
        version = importlib.metadata.version("whisperx")
        logger.info(f"WhisperX version: {version}")
    except importlib.metadata.PackageNotFoundError:
        logger.warning("WhisperX installed but version not found in metadata.")
    except ImportError as e:
        logger.error(f"Failed to import whisperx: {e}")
        return

    try:
        import pyannote.audio
        logger.info(f"pyannote.audio version: {pyannote.audio.__version__}")
    except ImportError as e:
        logger.error(f"Failed to import pyannote.audio: {e}")
        return

    # 4. Attempt a specialized load if authentication allows
    # We won't run full inference to avoid downloading huge models, but we can check if standard library calls don't segfault.
    
    logger.info("Imports successful. Checking for binary incompatibility/segfault risks...")
    
    try:
        # Just creating a tensor and doing a simple operation checks some C libs
        x = torch.tensor([1.0, 2.0])
        y = x * 2.0
        logger.info("Basic PyTorch Tensor operations verified.")
    except Exception as e:
        logger.error(f"PyTorch operation failed: {e}")

    logger.info("VERIFICATION COMPLETE: No immediate import crashes detected.")

if __name__ == "__main__":
    verify_setup()
