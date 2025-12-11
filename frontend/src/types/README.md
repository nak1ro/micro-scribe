# TypeScript Types

Shared TypeScript types and interfaces.

## Structure

- `api/` - API request/response DTOs matching backend
- `models/` - Domain models used in the application
- `common/` - Utility types (Result, Paginated, etc.)

## Guidelines

1. API types should match backend DTOs exactly (camelCase)
2. Domain models can differ from API types when needed
3. Use string union types for enums
4. Keep types DRY using intersection and utility types
