# API Client

Core API client configuration and utilities.

## Contains

- **client.ts** - Configured axios/fetch instance with base URL
- **interceptors.ts** - Request/response interceptors
- **endpoints.ts** - API endpoint constants
- **error-handler.ts** - Centralized error handling

## Features

- Automatic JWT token attachment
- Token refresh on 401 responses
- Request/response logging (development)
- Timeout configuration
- Base URL from environment variables
