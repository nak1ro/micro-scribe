import os
import uvicorn

if __name__ == "__main__":
    # IMPORTANT for single GPU: keep workers=1, control concurrency via MAX_CONCURRENT.
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        workers=int(os.getenv("UVICORN_WORKERS", "1")),
    )
