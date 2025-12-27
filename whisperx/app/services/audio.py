import os
import tempfile
import asyncio
import subprocess
from fastapi import UploadFile, HTTPException
from app.core.config import MAX_BYTES, MAX_UPLOAD_MB, MAX_AUDIO_DURATION

async def get_audio_duration(path: str) -> float:
    """Get audio duration using ffprobe."""
    try:
        # Use ffprobe to get duration
        cmd = [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            path
        ]
        # Run asynchronously to avoid blocking event loop
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            # If ffprobe fails, we might want to log it but maybe not fail hard?
            # For strict guard, we fail.
            raise RuntimeError(f"ffprobe failed: {stderr.decode()}")
            
        return float(stdout.decode().strip())
    except Exception as e:
        # If ffprobe not installed or fails, decide policy.
        # Here we log and re-raise or return 0. 
        # For production readiness, let's assume ffprobe is available (whisperx needs it).
        raise HTTPException(status_code=400, detail=f"Could not determine audio duration: {str(e)}")

async def save_upload_to_tempfile(file: UploadFile) -> str:
    """Stream upload to disk."""
    suffix = os.path.splitext(file.filename or "")[1]
    
    # Use delete=False so we can read it, but we MUST ensure cleanup
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp_path = tmp.name
    
    try:
        total = 0
        while True:
            chunk = await file.read(1024 * 1024)  # 1MB
            if not chunk:
                break
            total += len(chunk)
            if total > MAX_BYTES:
                tmp.close()
                os.remove(tmp_path)
                raise HTTPException(status_code=413, detail=f"File too large (max {MAX_UPLOAD_MB} MB)")
            tmp.write(chunk)
    except Exception:
        tmp.close()
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise
    finally:
        tmp.close()
        
    return tmp_path
