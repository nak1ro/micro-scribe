# API Client

Core API client configuration and utilities.

## Contains

- **client.ts** - Configured axios instance with `withCredentials: true` for cookie-based auth.
- **interceptors.ts** - Request/response interceptors (handles global 401s).
- **endpoints.ts** - Centralized API endpoint constants.
- **error-handler.ts** - Centralized error handling for RFC 7807 responses.

## Usage

```typescript
import { apiClient, API_ENDPOINTS, handleApiError } from '@/services/api';

try {
  const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
  console.log(response.data);
} catch (error) {
  const apiError = handleApiError(error);
  console.error(apiError.message);
}
```

## Features

- **Cookie Auth**: `withCredentials: true` ensures httpOnly cookies are sent with every request.
- **401 Handling**: Broadcasts an `api:unauthorized` event on 401 responses.
- **Error Parsing**: Automatically extracts validation errors and messages from backend responses.
- **Type Safety**: Helper types for API errors.
