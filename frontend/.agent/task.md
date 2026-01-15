# Task: Restructure Transcription Feature

## Objective
Restructure `src/features/transcription` to use Domain-Driven Vertical Slicing, resolving nesting issues and improving component organization.

## Plan
- [ ] **Finalize Structure Plan** <!-- id: 0 -->
    - [ ] Update proposal to address component density (Component Folders) <!-- id: 1 -->
    - [ ] Get user confirmation <!-- id: 2 -->
- [ ] **Phase 1: Analysis Sub-feature** <!-- id: 3 -->
    - [ ] Create `analysis/` root and sub-folders (`widgets`, `shared`) <!-- id: 4 -->
    - [ ] Move main components (`AnalysisContent.tsx`, `AnalysisMenu.tsx`) <!-- id: 5 -->
    - [ ] Group `ActionItems` into `widgets/ActionItems/` (move `ActionItemsView.tsx` -> `index.tsx`, move `ActionItemRow.tsx`) <!-- id: 6 -->
    - [ ] Group `MeetingMinutes` into `widgets/MeetingMinutes/` (move `MeetingMinutesView.tsx` -> `index.tsx`, move `MeetingMinutesSection.tsx`) <!-- id: 21 -->
    - [ ] Move other views (`ShortSummaryView`, `SentimentView`, `TopicsView`, `TLDRCard`) to `widgets/` <!-- id: 22 -->
    - [ ] Move shared logic (`useAnalysis`, `constants`) <!-- id: 7 -->
- [ ] **Phase 2: Viewer Sub-feature** <!-- id: 8 -->
    - [ ] Elevate `viewer/` to feature root <!-- id: 9 -->
    - [ ] Move hooks (`useAudioSync`, `useSegmentEdit`) <!-- id: 10 -->
- [ ] **Phase 3: Upload/Create Sub-feature** <!-- id: 11 -->
    - [ ] Elevate `create/` to `upload/` <!-- id: 12 -->
    - [ ] Move hooks (`useFileUpload`) <!-- id: 13 -->
- [ ] **Phase 4: List Sub-feature** <!-- id: 14 -->
    - [ ] Elevate `list/` to feature root <!-- id: 15 -->
    - [ ] Move hooks (`useTranscriptions`, `useSignalREvents`) <!-- id: 16 -->
- [ ] **Phase 5: Cleanup & Verification** <!-- id: 17 -->
    - [ ] Remove empty `components/` and `hooks/` folders <!-- id: 18 -->
    - [ ] Fix all imports <!-- id: 19 -->
    - [ ] Verify build (`tsc`) <!-- id: 20 -->
