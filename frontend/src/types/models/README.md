# Domain Models

Application domain models used throughout the frontend.

## Contains

- **user.ts** - User, subscription, profile models
- **media.ts** - MediaFile model with Date objects
- **transcription.ts** - TranscriptionJob, Segment, Chapter models

## Guidelines

- Transform API DTOs to domain models (e.g., parse dates)
- Include computed properties where useful
- Domain models represent how data is used in the UI
