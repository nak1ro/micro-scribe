from typing import Optional, List, Any
from pydantic import BaseModel, Field

class SegmentResponse(BaseModel):
    text: str
    startSeconds: float
    endSeconds: float
    speaker: Optional[str] = None


class TranscriptionResponse(BaseModel):
    fullTranscript: str
    detectedLanguage: Optional[str] = None
    segments: List[SegmentResponse]
    chapters: List[Any] = Field(default_factory=list)
