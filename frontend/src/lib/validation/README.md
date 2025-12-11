# Validation Schemas

Form validation schemas using Zod or Yup.

## Contains

- **auth.ts** - Login, register, password reset schemas
- **transcription.ts** - Transcription creation schema
- **profile.ts** - User profile update schema
- **common.ts** - Shared validation patterns (email, password)

## Guidelines

- Define reusable base schemas for common patterns
- Match backend validation rules
- Provide user-friendly error messages
- Export both schema and inferred types
