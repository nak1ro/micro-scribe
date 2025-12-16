# ScribeApi - API Documentation

> **Version:** 2.0  
> **Base URL:** `/api`  
> **Last Updated:** December 12, 2024

This document provides comprehensive API documentation for the ScribeApi backend, designed for frontend developers. It covers all endpoints, request/response schemas, validation rules, and TypeScript interfaces.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Media Files](#media-files)
3. [Uploads](#uploads)
4. [Transcriptions](#transcriptions)
5. [Webhooks](#webhooks)
6. [Common Types & Enums](#common-types--enums)
7. [Error Handling](#error-handling)

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
  fileType: MediaFileType;            // 0 = Audio, 1 = Video
  durationSeconds: number | null;
  normalizedAudioObjectKey: string | null;
  presignedUrl: string | null;        // URL for playback/download (expires in 15 min)
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

Uploads use a **direct-to-storage** pattern with presigned URLs. The API supports both single-file uploads and multipart uploads for large files.

### Upload Flow

1. **Initiate Session** - Request presigned URL(s) and storage configuration
2. **Upload to Storage** - Client uploads directly to S3/storage using presigned URL
3. **Complete Upload** - Notify API that upload is complete, triggers validation
4. **Poll Status** - Check session status until validation completes

### Endpoint: Initiate Upload Session

**Description:** Creates a new upload session and returns presigned URL for direct storage upload.

**Method:** `POST`  
**URL:** `/api/uploads/sessions`  
**Authorization:** Required (Authenticated)

#### Request Body
```typescript
interface InitiateUploadRequest {
  fileName: string;           // Required, original file name
  contentType: string;        // Required, MIME type (e.g., "audio/mp3")
  sizeBytes: number;          // Required, file size in bytes
  clientRequestId?: string;   // Optional, for idempotency
}
```

**Example Request:**
```json
{
  "fileName": "interview.mp3",
  "contentType": "audio/mp3",
  "sizeBytes": 52428800,
  "clientRequestId": "client-123-abc"
}
```

#### Response

**Success (200 OK)**
```typescript
interface UploadSessionResponse {
  id: string;                 // Session GUID
  status: string;             // "Created"
  uploadUrl: string | null;   // Presigned URL for single-file upload
  uploadId: string | null;    // Multipart upload ID (if multipart)
  key: string;                // Storage object key
  initialChunkSize: number;   // Suggested chunk size for multipart
  expiresAtUtc: string;       // When session expires
  correlationId: string;      // For distributed tracing
}
```

**Example Response:**
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "Created",
  "uploadUrl": "https://bucket.s3.amazonaws.com/uploads/...",
  "uploadId": null,
  "key": "uploads/user123/f47ac10b.mp3",
  "initialChunkSize": 52428800,
  "expiresAtUtc": "2024-12-12T18:00:00Z",
  "correlationId": "corr-abc-123"
}
```

---

### Endpoint: Complete Upload

**Description:** Notifies the API that the file upload is complete. Triggers background validation.

**Method:** `POST`  
**URL:** `/api/uploads/sessions/{id}/complete`  
**Authorization:** Required (Authenticated)

#### Route Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string (GUID) | Yes | Upload session ID |

#### Request Body
```typescript
interface CompleteUploadRequest {
  parts?: PartETagDto[] | null;  // Required for multipart, null for single-file
}

interface PartETagDto {
  partNumber: number;   // 1-indexed part number
  eTag: string;         // ETag from S3 upload response
}
```

**Example Request (Single File):**
```json
{}
```

**Example Request (Multipart):**
```json
{
  "parts": [
    { "partNumber": 1, "eTag": "\"abc123\"" },
    { "partNumber": 2, "eTag": "\"def456\"" }
  ]
}
```

#### Response

**Success (200 OK)**
```typescript
interface UploadSessionStatusResponse {
  id: string;
  status: string;               // "Uploaded", "Validating", "Ready", etc.
  errorMessage: string | null;
  createdAtUtc: string;
  uploadedAtUtc: string | null;
  validatedAtUtc: string | null;
}
```

---

### Endpoint: Get Upload Session Status

**Description:** Returns the current status of an upload session. Use for polling after completion.

**Method:** `GET`  
**URL:** `/api/uploads/sessions/{id}`  
**Authorization:** Required (Authenticated)

#### Route Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string (GUID) | Yes | Upload session ID |

#### Response

**Success (200 OK)** - Returns `UploadSessionStatusResponse`

**Session Status Flow:**
- `Created` → `Uploaded` → `Validating` → `Ready` (success)
- `Created` → `Uploaded` → `Validating` → `Invalid` (validation failed)
- `Created` → `Aborted` (user cancelled)
- `Created` → `Expired` (session timeout)

---

### Endpoint: Abort Upload Session

**Description:** Aborts an upload session and cleans up storage.

**Method:** `DELETE`  
**URL:** `/api/uploads/sessions/{id}`  
**Authorization:** Required (Authenticated)

#### Route Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string (GUID) | Yes | Upload session ID |

#### Response

**Success (204 No Content)**

---

## Transcriptions

### Endpoint: Create Transcription Job

**Description:** Creates a new transcription job. Can reference either a MediaFile ID or an UploadSession ID.

**Method:** `POST`  
**URL:** `/api/transcriptions`  
**Authorization:** Required (Authenticated)

#### Request Body
```typescript
interface CreateTranscriptionJobRequest {
  mediaFileId?: string;              // Optional, existing media file GUID
  uploadSessionId?: string;          // Optional, upload session GUID (for direct flow)
  quality?: TranscriptionQuality;    // Optional, default: 1 (Balanced)
  languageCode?: string | null;      // Optional, e.g., "en", "pl"
}
```

> **Note:** Provide either `mediaFileId` OR `uploadSessionId`, not both.

**Example Request:**
```json
{
  "uploadSessionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "quality": 2,
  "languageCode": "en"
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

**Description:** Returns detailed information about a transcription job, including segments.

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
  segments: TranscriptSegmentDto[];
  createdAtUtc: string;
  startedAtUtc: string | null;
  completedAtUtc: string | null;
  presignedUrl: string | null;
}

interface TranscriptSegmentDto {
  id: string;
  text: string;
  startSeconds: number;
  endSeconds: number;
  speaker: string | null;
  isEdited: boolean;
  originalText: string | null;
}
```

---

### Endpoint: Cancel Transcription Job

**Description:** Cancels a pending or processing transcription job.

**Method:** `POST`  
**URL:** `/api/transcriptions/{jobId}/cancel`  
**Authorization:** Required (Authenticated)

#### Response

**Success (204 No Content)**

---

### Endpoint: Export Transcript

**Description:** Exports transcript in various formats.

**Method:** `GET`  
**URL:** `/api/transcriptions/{jobId}/export`  
**Authorization:** Required (Authenticated)

#### Query Parameters
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| format | ExportFormat | No | Txt | Export format |

#### Response

**Success (200 OK)** - Returns file download with appropriate content-type

---

### Endpoint: Update Transcript Segment

**Description:** Edits the text of a specific transcript segment.

**Method:** `PATCH`  
**URL:** `/api/transcriptions/{jobId}/segments/{segmentId}`  
**Authorization:** Required (Authenticated)

#### Request Body
```typescript
interface UpdateSegmentRequest {
  text: string;  // New segment text
}
```

#### Response

**Success (200 OK)** - Returns updated `TranscriptSegmentDto`

---

### Endpoint: Revert Transcript Segment

**Description:** Reverts a segment to its original text.

**Method:** `POST`  
**URL:** `/api/transcriptions/{jobId}/segments/{segmentId}/revert`  
**Authorization:** Required (Authenticated)

#### Response

**Success (200 OK)** - Returns reverted `TranscriptSegmentDto`

---

## Usage

### Get Current Usage & Limits
Retrieves the current user's usage statistics and their plan limits.

**Endpoint:** `GET /api/usage/me`
**Auth:** Required

**Response:**
```json
{
  "planType": "Free",
  "usage": {
    "usedMinutesThisMonth": 12.5,
    "jobsCleanedToday": 2,
    "activeJobs": 1
  },
  "limits": {
    "dailyTranscriptionLimit": 5,
    "maxMinutesPerFile": 30,
    "maxFileSizeBytes": 104857600,
    "maxConcurrentJobs": 1,
    "transcriptionJobPriority": false
  }
}
```

## Webhooks

Subscribe to receive HTTP callbacks when transcription jobs complete, fail, or are cancelled.

### Supported Events
- `job.completed` - Transcription job completed successfully
- `job.failed` - Transcription job failed
- `job.cancelled` - Transcription job was cancelled

### Webhook Security

All webhook deliveries include an HMAC-SHA256 signature header for verification:

```
X-Webhook-Signature: sha256=<hex-encoded-signature>
```

Verify by computing HMAC-SHA256 of the raw request body using your secret.

---

### Endpoint: Create Webhook Subscription

**Description:** Creates a new webhook subscription.

**Method:** `POST`  
**URL:** `/api/webhooks`  
**Authorization:** Required (Authenticated)

#### Request Body
```typescript
interface CreateWebhookRequest {
  url: string;           // Required, HTTPS endpoint URL
  secret: string;        // Required, shared secret for HMAC signing
  events: string[];      // Required, list of event types to subscribe
}
```

**Example Request:**
```json
{
  "url": "https://myapp.com/webhooks/scribe",
  "secret": "my-secure-secret-key",
  "events": ["job.completed", "job.failed"]
}
```

#### Response

**Success (201 Created)**
```typescript
interface WebhookSubscriptionDto {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAtUtc: string;
  lastTriggeredAtUtc: string | null;
}
```

---

### Endpoint: List Webhook Subscriptions

**Description:** Returns all webhook subscriptions for the authenticated user.

**Method:** `GET`  
**URL:** `/api/webhooks`  
**Authorization:** Required (Authenticated)

#### Response

**Success (200 OK)** - Returns `WebhookSubscriptionDto[]`

---

### Endpoint: Get Webhook Subscription

**Description:** Returns details of a specific webhook subscription.

**Method:** `GET`  
**URL:** `/api/webhooks/{id}`  
**Authorization:** Required (Authenticated)

#### Response

**Success (200 OK)** - Returns `WebhookSubscriptionDto`

---

### Endpoint: Update Webhook Subscription

**Description:** Updates a webhook subscription. All fields are optional.

**Method:** `PATCH`  
**URL:** `/api/webhooks/{id}`  
**Authorization:** Required (Authenticated)

#### Request Body
```typescript
interface UpdateWebhookRequest {
  url?: string;
  secret?: string;
  events?: string[];
  isActive?: boolean;
}
```

**Example Request:**
```json
{
  "isActive": false
}
```

#### Response

**Success (200 OK)** - Returns updated `WebhookSubscriptionDto`

---

### Endpoint: Delete Webhook Subscription

**Description:** Deletes a webhook subscription.

**Method:** `DELETE`  
**URL:** `/api/webhooks/{id}`  
**Authorization:** Required (Authenticated)

#### Response

**Success (204 No Content)**

---

### Endpoint: Get Webhook Deliveries

**Description:** Returns delivery history for a webhook subscription.

**Method:** `GET`  
**URL:** `/api/webhooks/{id}/deliveries`  
**Authorization:** Required (Authenticated)

#### Query Parameters
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| limit | number | No | 50 | Maximum number of deliveries to return |

#### Response

**Success (200 OK)**
```typescript
interface WebhookDeliveryDto {
  id: string;
  event: string;
  status: WebhookDeliveryStatus;  // 0 = Pending, 1 = Sent, 2 = Failed
  attempts: number;
  responseStatusCode: number | null;
  createdAtUtc: string;
  lastAttemptAtUtc: string | null;
}
```

---

### Webhook Payload Format

When a webhook is triggered, the following payload is sent to your endpoint:

```typescript
interface WebhookPayload {
  event: string;       // Event type (e.g., "job.completed")
  timestamp: string;   // ISO 8601 timestamp
  data: object;        // Event-specific data
}
```

**Example Payload (job.completed):**
```json
{
  "event": "job.completed",
  "timestamp": "2024-12-12T15:30:00Z",
  "data": {
    "jobId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "mediaFileId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "durationSeconds": 125.5
  }
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
  Created = 0,
  Uploading = 1,
  Uploaded = 2,
  Validating = 3,
  Ready = 4,
  Invalid = 5,
  Failed = 6,
  Aborted = 7,
  Expired = 8
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

enum ExportFormat {
  Txt = 0,
  Srt = 1,
  Vtt = 2,
  Json = 3
}

enum WebhookDeliveryStatus {
  Pending = 0,
  Sent = 1,
  Failed = 2
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
| `204 No Content` | Success, no body |
| `400 Bad Request` | Validation error |
| `401 Unauthorized` | Not authenticated |
| `404 Not Found` | Resource not found |
| `409 Conflict` | Resource conflict (e.g., duplicate) |
| `422 Unprocessable Entity` | Semantic validation error |

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
| `POST` | `/api/uploads/sessions` | ✅ | Initiate upload session |
| `POST` | `/api/uploads/sessions/{id}/complete` | ✅ | Complete upload |
| `GET` | `/api/uploads/sessions/{id}` | ✅ | Get upload session status |
| `DELETE` | `/api/uploads/sessions/{id}` | ✅ | Abort upload session |
| `POST` | `/api/transcriptions` | ✅ | Create transcription job |
| `GET` | `/api/transcriptions/{jobId}` | ✅ | Get transcription job |
| `POST` | `/api/transcriptions/{jobId}/cancel` | ✅ | Cancel transcription job |
| `GET` | `/api/transcriptions/{jobId}/export` | ✅ | Export transcript |
| `PATCH` | `/api/transcriptions/{jobId}/segments/{segmentId}` | ✅ | Update segment |
| `POST` | `/api/transcriptions/{jobId}/segments/{segmentId}/revert` | ✅ | Revert segment |
| `POST` | `/api/webhooks` | ✅ | Create webhook subscription |
| `GET` | `/api/webhooks` | ✅ | List webhook subscriptions |
| `GET` | `/api/webhooks/{id}` | ✅ | Get webhook subscription |
| `PATCH` | `/api/webhooks/{id}` | ✅ | Update webhook subscription |
| `DELETE` | `/api/webhooks/{id}` | ✅ | Delete webhook subscription |
| `GET` | `/api/webhooks/{id}/deliveries` | ✅ | Get webhook deliveries |
| `GET` | `/api/usage/me` | ✅ | Get usage & limits |
