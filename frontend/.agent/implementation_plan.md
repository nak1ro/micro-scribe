# Implementation Plan: Restructuring Transcription Feature

## Goal
Restructure `src/features/transcription` from a component-heavy nesting structure to a Domain-Driven Vertical Slicing structure. This will improve discoverability, logic colocation, and reduce nesting depth.

## User Review Required
> [!IMPORTANT]
> This is a large structural refactor involving moving many files. While functionality should remain identical, imports across the application that reference `features/transcription/components/...` will need to be updated.

## Proposed Changes

### Structure Overview
We will elevate sub-domains (`analysis`, `viewer`, `upload`, `list`) from `components/` to be top-level directories in the feature. Files will be moved and renamed.

### Phase 1: Analysis Sub-feature (`src/features/transcription/analysis/`)
#### [NEW] Directory Structure
```
transcription/
└── analysis/
    ├── AnalysisContent.tsx         (was AnalysisContentView.tsx)
    ├── AnalysisMenu.tsx
    ├── useAnalysis.ts              (moved from hooks/)
    ├── constants.ts
    ├── shared/                     (AnalysisStates)
    └── widgets/
        ├── ShortSummaryView.tsx
        ├── ...
        ├── ActionItems/            (ActionItemsView -> index.tsx, ActionItemRow)
        └── MeetingMinutes/         (MeetingMinutesView -> index.tsx, Section)
```

### Phase 2: Viewer (`src/features/transcription/viewer/`)
- Move content of `components/viewer` to `viewer/`.
- Move `hooks/useAudioSync.ts`, `hooks/useSegmentEdit.ts` to `viewer/`.

### Phase 3: Upload (`src/features/transcription/upload/`)
- Move content of `components/create` to `upload/` (renamed from `create`).
- Move `hooks/useFileUpload.ts` to `upload/`.

### Phase 4: List (`src/features/transcription/list/`)
- Move content of `components/list` to `list/`.
- Move `hooks/useTranscriptions.ts`, `hooks/useSignalREvents.ts` to `list/`.

### Phase 5: Shared & Cleanup
- Create `src/features/transcription/shared/` for generic components if any remain.
- Delete empty `components/` and `hooks/` directories.
- Update `src/features/transcription/index.ts`.

## Verification Plan

### Automated Verification
- Run `npx tsc --noEmit` to verify all imports are resolved.
- Run `eslint` (if available) to check for linting errors.

### Manual Verification
- Since we lack comprehensive E2E tests for this, manual verification is key:
    - **Analysis:** Verify "TL;DR", "Action Items", and "Meeting Minutes" render correctly.
    - **Viewer:** Verify audio playback and sync still works.
    - **List:** Verify transcription list loads.
    - **Upload:** Open the "New Transcription" modal.
