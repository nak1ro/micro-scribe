import os
import torch
import logging

# -------------------------------------------------------------------------
# Set env var for lightning_fabric / speechbrain / etc.
# -------------------------------------------------------------------------
os.environ["TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD"] = "1"

# Kept for backward compatibility with main.py import
HAS_OMEGACONF = True

logger = logging.getLogger("whisperx-boot")

def apply_fixes():
    """
    Apply global fixes for compatibility.
    """
    # -------------------------------------------------------------------------
    # Fix for PyTorch 2.6+ weights_only=True default
    # -------------------------------------------------------------------------
    # The previous attempt to conditionally set weights_only=False failed, 
    # implying some libraries (like lightning_fabric) might be explicitly 
    # passing weights_only=True. 
    #
    # We now AGGRESSIVELY override it to False.
    
    try:
        original_load = torch.load
        
        def patched_load(*args, **kwargs):
            # Aggressively disable weights_only security check
            # This mimics the behavior of older PyTorch versions (<2.6)
            kwargs['weights_only'] = False
            return original_load(*args, **kwargs)
            
        torch.load = patched_load
        logger.info("Aggressively patched torch.load to force weights_only=False.")
        
    except Exception as e:
        logger.warning(f"Failed to patch torch.load: {e}")
