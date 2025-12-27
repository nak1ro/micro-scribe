---
description: Complete application workflow for MicroScribe - audio/video transcription platform
---

# MicroScribe Application Workflow

## Overview

MicroScribe is a cloud-based audio/video transcription service using OpenAI Whisper. This document outlines all steps to run, develop, and use the application.

---

## 1. Prerequisites

### System Requirements
- **Node.js**: v18+ (recommended v20)
- **npm**: v9+
- **Backend**: .NET 8 API running (ScribeApi)
- **Database**: PostgreSQL

### Environment Setup
Create `.env.local` file in frontend root:
```env
NEXT_PUBLIC_API_URL=http://localhost:5150/api
```

---

## 2. Development Server

### Install Dependencies
```bash
npm install
```

### Start Development Server
// turbo
```bash
npm run dev
```
Frontend runs at: `http://localhost:3000`

### Run Production Build
```bash
npm run build
npm run start
```

### Lint Code
// turbo
```bash
npm run lint
```

---

## 3. Application Routes

### Public Routes (`src/app/(public)/`)
| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/auth` | Login/Register page |
| `/pricing` | Subscription plans |

### Protected Routes (`src/app/(protected)/`)
| Route | Purpose |
|-------|---------|
| `/dashboard` | User dashboard with transcription list |
| `/transcriptions/[id]` | View individual transcription |
| `/account` | User account settings |

---

## 4. Feature Modules (`src/features/`)

| Feature | Purpose |
|---------|---------|
| `auth` | Authentication forms, OAuth buttons |
| `landing` | Landing page sections (Hero, Features, Pricing) |
| `dashboard` | Transcription cards, folder management |
| `transcription` | Transcription viewer, audio player, actions |
| `billing` | Subscription management |
| `folder` | Folder organization |
| `account` | User settings |
| `pricing` | Pricing tiers display |

---

## 5. User Flow

### 5.1 Authentication Flow
1. User visits `/auth`
2. Choose: **Login** | **Register** | **OAuth** (Google)
3. Backend sets httpOnly JWT cookie
4. Redirect to `/dashboard`

### 5.2 Transcription Flow
1. **Upload**: Drag & drop audio/video file on dashboard
2. **Progress**: Chunked upload with progress indicator
3. **Processing**: Backend extracts audio (FFmpeg) → Whisper API
4. **View**: Click transcription to see full text with timestamps
5. **Export**: Download as TXT, SRT, CSV, DOCX

### 5.3 Folder Organization
1. Create folders from dashboard sidebar
2. Drag transcriptions into folders
3. Filter by folder or view all

---

## 6. Subscription Tiers

| Feature | Free | Pro |
|---------|------|-----|
| Daily transcriptions | 10 | Unlimited |
| Max file duration | 10 min | 5 hours |
| Max file size | 100 MB | 1 GB |
| Concurrent jobs | 1 | 5 |
| Priority processing | ❌ | ✅ |

---

## 7. Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (protected)/        # Auth-required routes
│   └── (public)/           # Public routes
├── components/             # Shared UI components
│   └── ui/                 # Design system primitives
├── context/                # React Context providers
├── features/               # Feature-based modules
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities, config, constants
├── services/               # API service layer
├── styles/                 # Global CSS
└── types/                  # TypeScript definitions
```

---

## 8. Key Services (`src/services/`)

| Service | Purpose |
|---------|---------|
| `api/axiosInstance.ts` | Axios config with interceptors |
| `auth/` | Auth API calls |
| `transcription/` | Transcription CRUD |
| `upload/` | Chunked file upload |
| `media/` | Media file management |

---

## 9. State Management

- **Server State**: TanStack Query for API data
- **Client State**: React Context for UI state
- **Auth State**: AuthContext + server-side validation

---

## 10. Common Development Tasks

### Add New Feature
1. Create folder in `src/features/<feature-name>/`
2. Add: `components/`, `hooks/`, `api.ts`, `types.ts`
3. Create page in `src/app/(protected|public)/<route>/`

### Add API Endpoint
1. Add types in `src/types/` or feature `types.ts`
2. Create service function in `src/services/<service>/`
3. Use TanStack Query hooks in components

### Style Components
1. Use Tailwind utility classes
2. Dark mode: prefix with `dark:`
3. Custom tokens in `tailwind.config.ts`

---

## 11. Testing Checklist

- [ ] Authentication flow (login/register/OAuth)
- [ ] File upload progress
- [ ] Transcription viewing
- [ ] Audio playback sync
- [ ] Folder management
- [ ] Export functionality
- [ ] Mobile responsiveness
- [ ] Dark/light theme toggle

---

## 12. Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Deployment Platforms
- **Vercel**: Recommended for Next.js
- **Self-hosted**: Use `npm run build && npm run start`
