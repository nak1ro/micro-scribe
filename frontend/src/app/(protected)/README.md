# Dashboard Feature

Main dashboard for authenticated users.

## Route: `/dashboard`

Main view showing transcription history and ability to create new transcriptions.
**Access**: Protected (requires authentication)

## Components To Build

- **TranscriptionList** - Paginated list of user's transcriptions
- **TranscriptionCard** - Individual transcription item with status
- **NewTranscriptionModal** - Create new transcription dialog
- **FileUploader** - Drag-and-drop media upload with progress
- **UploadProgress** - Upload progress indicator
- **EmptyDashboard** - Empty state when no transcriptions
- **DashboardStats** - Usage statistics (optional)
- **StatusBadge** - Job status indicator (Pending/Processing/Completed/Failed)

## Features

- View transcription history with pagination
- Start new transcription by uploading media
- View transcription status and details
- Delete transcriptions
- Search and filter transcriptions (future)
