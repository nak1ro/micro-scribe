# Utility Functions

Pure utility functions used throughout the application.

## Contains

- **format.ts** - Date, time, duration, and number formatting
- **cn.ts** - Classname merging utility (clsx + tailwind-merge)
- **storage.ts** - LocalStorage/SessionStorage helpers
- **validation.ts** - Common validation helpers
- **file.ts** - File size formatting, type checking

## Guidelines

- Functions must be pure (no side effects)
- Include unit tests for all utilities
- Use TypeScript generics where appropriate
