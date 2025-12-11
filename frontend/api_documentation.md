# ScribeApi - API Documentation

> **Version:** 1.0  
> **Base URL:** `/api`  
> **Last Updated:** December 11, 2024

This document provides comprehensive API documentation for the ScribeApi backend, designed for frontend developers. It covers all endpoints, request/response schemas, validation rules, and TypeScript interfaces.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Media Files](#media-files)
3. [Uploads](#uploads)
4. [Transcriptions](#transcriptions)
5. [Common Types & Enums](#common-types--enums)
6. [Error Handling](#error-handling)

---

## Authentication

The API uses **cookie-based authentication** via ASP.NET Core Identity. After successful login/register, an authentication cookie is automatically set in the response. Subsequent requests must include this cookie.

### Cookie Configuration
- **Cookie Name:** `.AspNetCore.Identity.Application`
- **HTTP Only:** Yes
- **Secure:** Yes (HTTPS only in production)
- **SameSite:** Lax

---

## Auth Endpoints

### Endpoint: Register User

**Description:** Creates a new user account and returns user information.

**Method:** `POST`  
**URL:** `/api/auth/register`  
**Authorization:** None (Anonymous)

#### Request Body
```typescript
interface RegisterRequest {
  email: string;           // Required, valid email format
  password: string;        // Required, min 8 chars, must contain: uppercase, lowercase, digit, special char
  confirmPassword: string; // Required, must match password
}
```

**Validation Rules:**
- `email`: Required, must be valid email format
- `password`: Required, minimum 8 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one digit
  - At least one special character
- `confirmPassword`: Must match `password`

**Example Request:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "confirmPassword": "SecureP@ss123"
}
```

#### Response

**Success (201 Created)**
```typescript
interface UserResponse {
  id: string;              // GUID format
  email: string;
  emailConfirmed: boolean;
  roles: string[];
}
```

**Example Response:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "user@example.com",
  "emailConfirmed": false,
  "roles": []
}
```

**Headers:** Sets authentication cookie on success

---

### Endpoint: Login

**Description:** Authenticates a user and creates a session.

**Method:** `POST`  
**URL:** `/api/auth/login`  
**Authorization:** None (Anonymous)

#### Request Body
```typescript
interface LoginRequest {
  email: string;          // Required, valid email format
  password: string;       // Required
  rememberMe?: boolean;   // Optional, default: false
}
```

**Example Request:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "rememberMe": true
}
```

#### Response

**Success (200 OK)**
```typescript
interface UserResponse {
  id: string;
  email: string;
  emailConfirmed: boolean;
  roles: string[];
}
```

**Error Responses:**
- `400 Bad Request` - Invalid credentials or validation errors
- `401 Unauthorized` - Account locked or email not confirmed

---

### Endpoint: Logout

**Description:** Logs out the current user and clears the session cookie.

**Method:** `POST`  
**URL:** `/api/auth/logout`  
**Authorization:** Required (Authenticated)

#### Response

**Success (200 OK)**
```json
{
  "message": "Logged out successfully."
}
```

---

### Endpoint: Forgot Password

**Description:** Initiates password reset flow by sending a reset email (if account exists).

**Method:** `POST`  
**URL:** `/api/auth/forgot-password`  
**Authorization:** None (Anonymous)

#### Request Body
```typescript
interface ForgotPasswordRequest {
  email: string;  // Required, valid email format
}
```

#### Response

**Success (200 OK)**
```json
{
  "message": "If the email exists, a password reset link has been sent."
}
```

> **Note:** Always returns success to prevent email enumeration attacks.

---

### Endpoint: Reset Password

**Description:** Resets user password using the token from the reset email.

**Method:** `POST`  
**URL:** `/api/auth/reset-password`  
**Authorization:** None (Anonymous)

#### Request Body
```typescript
interface ResetPasswordRequest {
  email: string;              // Required, valid email
  token: string;              // Required, from reset email
  newPassword: string;        // Required, same rules as registration
  confirmNewPassword: string; // Required, must match newPassword
}
```

#### Response

**Success (200 OK)**
```json
{
  "message": "Password has been reset successfully."
}
```

---

### Endpoint: Change Password

**Description:** Changes the password for the authenticated user.

**Method:** `POST`  
**URL:** `/api/auth/change-password`  
**Authorization:** Required (Authenticated)

#### Request Body
```typescript
interface ChangePasswordRequest {
  currentPassword: string;     // Required
  newPassword: string;         // Required, same validation as registration
  confirmNewPassword: string;  // Required, must match newPassword
}
```

#### Response

**Success (200 OK)**
```json
{
  "message": "Password changed successfully."
}
```

---

### Endpoint: Confirm Email

**Description:** Confirms a user's email address using the confirmation link.

**Method:** `GET`  
**URL:** `/api/auth/confirm-email`  
**Authorization:** None (Anonymous)

#### Query Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| userId | string | Yes | User ID from confirmation email |
| token | string | Yes | Confirmation token from email |

#### Response

**Success (200 OK)**
```json
{
  "message": "Email confirmed successfully."
}
```

---

### Endpoint: External Login (OAuth)

**Description:** Authenticates a user using an external OAuth provider's ID token.

**Method:** `POST`  
**URL:** `/api/auth/external-login`  
**Authorization:** None (Anonymous)

#### Request Body
```typescript
interface ExternalAuthRequest {
  provider: string;  // Required, e.g., "google"
  idToken: string;   // Required, OAuth ID token
}
```

#### Response

**Success (200 OK)** - Returns `UserResponse`

---

### Endpoint: OAuth Callback

**Description:** Handles OAuth authorization code callback (server-side OAuth flow).

**Method:** `POST`  
**URL:** `/api/auth/oauth/callback`  
**Authorization:** None (Anonymous)

#### Request Body
```typescript
interface OAuthCallbackRequest {
  provider: string;      // Required, valid providers: "google"
  code: string;          // Required, authorization code from OAuth provider
  state?: string | null; // Optional, CSRF state parameter
}
```

#### Response

**Success (200 OK)** - Returns `UserResponse`

---

### Endpoint: Link OAuth Account

**Description:** Links an external OAuth account to the current authenticated user.

**Method:** `POST`  
**URL:** `/api/auth/oauth/link`  
**Authorization:** Required (Authenticated)

#### Request Body
```typescript
interface LinkOAuthAccountRequest {
  provider: string;  // Required, valid providers: "google"
  idToken: string;   // Required, OAuth ID token
}
```

#### Response

**Success (200 OK)**
```json
{
  "message": "External account linked successfully."
}
```

---

### Endpoint: Get Linked OAuth Accounts

**Description:** Returns all linked external OAuth accounts for the authenticated user.

**Method:** `GET`  
**URL:** `/api/auth/oauth/linked-accounts`  
**Authorization:** Required (Authenticated)

#### Response

**Success (200 OK)**
```typescript
interface ExternalLoginResponse {
  provider: string;
  providerKey: string;
  accessTokenExpiresAt: string | null;
}

type LinkedAccountsResponse = ExternalLoginResponse[];
```

---

### Endpoint: Unlink OAuth Account

**Description:** Unlinks an external OAuth account from the authenticated user.

**Method:** `DELETE`  
**URL:** `/api/auth/oauth/unlink/{provider}`  
**Authorization:** Required (Authenticated)

#### Route Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| provider | string | Yes | OAuth provider name to unlink |

#### Response

**Success (200 OK)**
```json
{
  "message": "google account unlinked successfully."
}
```

---

### Endpoint: Get Current User (Me)

**Description:** Returns information about the currently authenticated user.

**Method:** `GET`  
**URL:** `/api/auth/me`  
**Authorization:** Required (Authenticated)

#### Response

**Success (200 OK)** - Returns `UserResponse`

---

## Media Files

All media endpoints require authentication.

### Endpoint: List Media Files

**Description:** Returns a paginated list of media files belonging to the authenticated user.

**Method:** `GET`  
**URL:** `/api/media`  
**Authorization:** Required (Authenticated)

#### Query Parameters
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| page | number | No | 1 | Page number (1-indexed) |
| pageSize | number | No | 10 | Items per page |

#### Response

**Success (200 OK)**
```typescript
interface MediaFileResponse {
  id: string;
  originalFileName: string;
  sizeBytes: number;
  contentType: string;
  fileType: MediaFileType;       // 0 = Audio, 1 = Video
  durationSeconds: number | null;
  audioPath: string | null;
  createdAtUtc: string;
}

interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

---

### Endpoint: Get Media File by ID

**Description:** Returns details of a specific media file.

**Method:** `GET`  
**URL:** `/api/media/{id}`  
**Authorization:** Required (Authenticated)

#### Route Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string (GUID) | Yes | Media file ID |

#### Response

**Success (200 OK)** - Returns `MediaFileResponse`

---

### Endpoint: Delete Media File

**Description:** Deletes a media file and its associated storage.

**Method:** `DELETE`  
**URL:** `/api/media/{id}`  
**Authorization:** Required (Authenticated)

#### Response

**Success (204 No Content)**

---

## Uploads

Uploads use a **chunked upload** pattern for large files.

### Upload Flow
1. **Create Session** - Initialize upload with file metadata
2. **Upload Chunks** - Send file chunks sequentially
3. **Complete** - Final chunk triggers merge and returns MediaFile

### Endpoint: Create Upload Session

**Description:** Initializes a new chunked upload session.

**Method:** `POST`  
**URL:** `/api/uploads/sessions`  
**Authorization:** Required (Authenticated)

#### Request Body
```typescript
interface InitUploadRequest {
  fileName: string;        // Required
  contentType: string;     // Required, MIME type
  totalSizeBytes: number;  // Required, must be > 0
  chunkSizeBytes: number;  // Required, must be > 0
  durationMinutes: number; // Required
}
```

#### Response

**Success (200 OK)**
```typescript
interface UploadSessionResponse {
  id: string;
  storageKeyPrefix: string;
  status: UploadSessionStatus;
  expiresAtUtc: string;
}
```

---

### Endpoint: Upload Chunk

**Description:** Uploads a single chunk. Final chunk triggers merge and returns MediaFile.

**Method:** `PUT`  
**URL:** `/api/uploads/sessions/{sessionId}/chunks/{chunkIndex}`  
**Authorization:** Required (Authenticated)  
**Content-Type:** `multipart/form-data`

#### Route Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| sessionId | string (GUID) | Yes | Upload session ID |
| chunkIndex | number | Yes | Zero-based chunk index |

#### Form Data
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| chunk | File | Yes | Binary file chunk |

#### Response

**Chunk Received (202 Accepted):**
```json
{
  "message": "Chunk received"
}
```

**Upload Complete (200 OK):** Returns `MediaFileResponse`

---

## Transcriptions

### Endpoint: Create Transcription Job

**Description:** Creates a new transcription job for a media file.

**Method:** `POST`  
**URL:** `/api/transcriptions`  
**Authorization:** Required (Authenticated)

#### Request Body
```typescript
interface CreateTranscriptionJobRequest {
  mediaFileId: string;               // Required
  quality?: TranscriptionQuality;    // Optional, default: 1 (Balanced)
  languageCode?: string | null;      // Optional, e.g., "en", "pl"
}
```

#### Response

**Success (201 Created)**
```typescript
interface TranscriptionJobResponse {
  jobId: string;
  mediaFileId: string;
  status: TranscriptionJobStatus;
  createdAtUtc: string;
}
```

---

### Endpoint: Get Transcription Job

**Description:** Returns detailed information about a transcription job.

**Method:** `GET`  
**URL:** `/api/transcriptions/{jobId}`  
**Authorization:** Required (Authenticated)

#### Response

**Success (200 OK)**
```typescript
interface TranscriptionJobDetailResponse {
  jobId: string;
  mediaFileId: string;
  originalFileName: string;
  status: TranscriptionJobStatus;
  quality: TranscriptionQuality;
  languageCode: string | null;
  transcript: string | null;
  errorMessage: string | null;
  durationSeconds: number | null;
  createdAtUtc: string;
  startedAtUtc: string | null;
  completedAtUtc: string | null;
}
```

---

## Common Types & Enums

```typescript
enum MediaFileType {
  Audio = 0,
  Video = 1
}

enum UploadSessionStatus {
  Active = 0,
  Completed = 1,
  Expired = 2,
  Cancelled = 3,
  Failed = 4
}

enum TranscriptionJobStatus {
  Pending = 0,
  Processing = 1,
  Completed = 2,
  Failed = 3,
  Cancelled = 4
}

enum TranscriptionQuality {
  Fast = 0,       // Lower cost, lower accuracy
  Balanced = 1,   // Default
  Accurate = 2    // Best quality
}

enum PlanType {
  Free = 0,
  Pro = 1
}
```

---

## Error Handling

### Error Response Format (RFC 7807)
```typescript
interface ValidationProblemDetails {
  type: string;
  title: string;
  status: number;
  errors?: Record<string, string[]>;
  traceId?: string;
}
```

### Common HTTP Status Codes
| Code | Description |
|------|-------------|
| `200 OK` | Success |
| `201 Created` | Resource created |
| `202 Accepted` | Request accepted (chunk upload) |
| `204 No Content` | Success, no body |
| `400 Bad Request` | Validation error |
| `401 Unauthorized` | Not authenticated |
| `404 Not Found` | Resource not found |

---

## API Endpoint Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | No | Register new user |
| `POST` | `/api/auth/login` | No | Login user |
| `POST` | `/api/auth/logout` | ✅ | Logout user |
| `POST` | `/api/auth/forgot-password` | No | Request password reset |
| `POST` | `/api/auth/reset-password` | No | Reset password |
| `POST` | `/api/auth/change-password` | ✅ | Change password |
| `GET` | `/api/auth/confirm-email` | No | Confirm email |
| `POST` | `/api/auth/external-login` | No | OAuth login |
| `POST` | `/api/auth/oauth/callback` | No | OAuth callback |
| `POST` | `/api/auth/oauth/link` | ✅ | Link OAuth account |
| `GET` | `/api/auth/oauth/linked-accounts` | ✅ | List linked accounts |
| `DELETE` | `/api/auth/oauth/unlink/{provider}` | ✅ | Unlink OAuth |
| `GET` | `/api/auth/me` | ✅ | Get current user |
| `GET` | `/api/media` | ✅ | List media files |
| `GET` | `/api/media/{id}` | ✅ | Get media file |
| `DELETE` | `/api/media/{id}` | ✅ | Delete media file |
| `POST` | `/api/uploads/sessions` | ✅ | Create upload session |
| `PUT` | `/api/uploads/sessions/{id}/chunks/{idx}` | ✅ | Upload chunk |
| `POST` | `/api/transcriptions` | ✅ | Create transcription job |
| `GET` | `/api/transcriptions/{jobId}` | ✅ | Get transcription job |
