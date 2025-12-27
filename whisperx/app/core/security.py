import secrets
from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader
from app.core.config import API_KEY

API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def validate_api_key(api_key_header: str = Security(api_key_header)):
    if not API_KEY:
        # If no API key is set in env, allow access (or fail, depending on policy.
        # usually safer to fail safe, but for easy dev we might allow)
        return None

    if not api_key_header:
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API Key",
        )

    # Constant-time comparison to prevent timing attacks
    if not secrets.compare_digest(api_key_header, API_KEY):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key",
        )
    return api_key_header
