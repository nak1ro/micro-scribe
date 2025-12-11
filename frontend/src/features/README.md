# Features

Feature-specific components, hooks, and logic organized by feature area.

## Structure

Each feature folder contains:
- `components/` - Feature-specific components
- `hooks/` - Feature-specific hooks (optional)
- `types.ts` - Feature-specific types (optional)

## Features

- `auth/` - Login, signup, password reset components
- `landing/` - Landing page sections (hero, pricing, reviews, etc.)
- `dashboard/` - Dashboard home, transcription list, upload
- `account/` - Profile settings, subscription management
- `transcription/` - Transcription viewer, export, player

## Guidelines

1. Keep feature-specific logic isolated
2. Compose with shared components from `components/`
3. Feature hooks can use shared hooks
4. Only export what other features need
