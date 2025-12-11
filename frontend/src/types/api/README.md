# API Types

TypeScript types matching backend API DTOs.

## Contains

- **auth.ts** - Auth request/response types
- **media.ts** - Media file DTOs
- **transcription.ts** - Transcription job DTOs
- **user.ts** - User profile DTOs
- **upload.ts** - Upload session DTOs
- **common.ts** - Shared API types (pagination, errors)

## Guidelines

- Use camelCase to match backend JSON serialization
- Keep in sync with backend DTO definitions
- Use ISO string format for dates in API types
