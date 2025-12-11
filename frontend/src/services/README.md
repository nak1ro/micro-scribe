# Services

API service layer for communicating with the backend.

## Structure

- `api/` - Core API client and request utilities
- `auth/` - Authentication API calls
- `media/` - Media file management API
- `transcription/` - Transcription job API
- `user/` - User profile and settings API
- `subscription/` - Subscription and billing API

## Guidelines

1. Services wrap fetch/axios calls to the backend
2. Handle response parsing and error transformation
3. Return typed responses matching backend DTOs
4. Use the centralized API client from `api/`
5. Include request interceptors for auth tokens
