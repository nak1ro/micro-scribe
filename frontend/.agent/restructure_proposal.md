# Restructuring Proposal for Transcription Feature

## Current State Analysis

The current structure of `src/features/transcription` follows a broadly layer-based organization, with a giant `components` folder that creates deep nesting and separation of related logic (components vs hooks).

**Current Structure:**
```
src/features/transcription/
├── components/                 <-- The "Double Nesting" Problem Root
│   ├── analysis/               <-- Nested sub-feature
│   │   ├── items/              <-- Deep nesting (Level 4)
│   │   ├── views/              <-- Deep nesting (Level 4)
│   │   └── ...
│   ├── viewer/
│   ├── create/
│   └── list/
├── hooks/                      <-- Hooks separated from their components
│   ├── useAnalysis.ts
│   ├── useFileUpload.ts
│   └── ...
├── types/
└── api/
```

**Issues:**
1.  **Deep Nesting:** Files like `src/features/transcription/components/analysis/views/ShortSummaryView.tsx` are buried 5 levels deep in the feature.
2.  **Logic Separation:** `useAnalysis.ts` is far from the `analysis` components it serves. `constants.ts` for analysis was in `components/analysis/constants.ts` while others might be elsewhere.
3.  **Discovery:** It's hard to see "what is the Analysis feature?" in one place.

## Proposed Structure: Domain-Driven Vertical Slicing

We recommend elevating the sub-domains (`analysis`, `viewer`, `create`, `list`) to be top-level citizens within the `transcription` feature, containing their own components, hooks, and utilities.

**New Structure:**

```
src/features/transcription/
├── analysis/                   <-- Elevated from components/analysis
│   ├── AnalysisContent.tsx     <-- Main entry (renamed from AnalysisContentView)
│   ├── AnalysisMenu.tsx
│   ├── useAnalysis.ts          <-- Moved from hooks/
│   ├── constants.ts            <-- Colocated config
│   └── components/             <-- Smaller sub-components (flattened)
│       ├── AnalysisStates.tsx
│       ├── ShortSummaryView.tsx
│       └── ...
├── viewer/                     <-- Elevated from components/viewer
│   ├── TranscriptionViewer.tsx
│   ├── useAudioSync.ts         <-- Moved from hooks/
│   ├── useSegmentEdit.ts       <-- Moved from hooks/
│   └── components/
│       ├── ViewerHeader.tsx
│       └── ...
├── upload/                     <-- Renamed from 'create' for clarity
│   ├── CreateTranscriptionModal.tsx
│   ├── useFileUpload.ts        <-- Moved from hooks/
│   └── components/
├── list/                       <-- Elevated from components/list
│   ├── TranscriptionList.tsx
│   ├── useTranscriptions.ts    <-- Moved from hooks/
│   └── components/
├── shared/                     <-- For truly shared items
│   ├── api/
│   ├── types/
│   └── components/             <-- Generic badges, formatted dates
└── index.ts                    <-- Public API of the feature
```

## Benefits
1.  **Reduced Nesting:** Removes `components/` layer. `src/features/transcription/analysis/AnalysisMenu.tsx` is easier to find.
2.  **Colocation:** "Things that change together stay together". Hooks and UI are side-by-side.
3.  **Scalability:** Each sub-directory acts like a mini-feature.
4.  **Clearer Boundaries:** It is obvious which hooks belong to the Viewer vs the List.

## Refinement: Handling Component Density

To address the concern about `analysis/components` becoming "messy" with 10-15 files, we will use **Component Folders** for significant widgets.

**Revised Structure for `analysis`:**
```
src/features/transcription/analysis/
├── AnalysisContent.tsx         <-- Main Entry
├── AnalysisMenu.tsx
├── constants.ts
├── useAnalysis.ts
├── shared/                     <-- Pure UI shared components
│   ├── AnalysisStates.tsx
│   └── ...
├── widgets/                    <-- High-level functional widgets
    ├── ShortSummaryView.tsx
    ├── SentimentView.tsx
    ├── ActionItems/            <-- Complex widget gets its own folder
    │   ├── index.tsx (renamed ActionItemsView)
    │   └── ActionItemRow.tsx
    └── MeetingMinutes/         <-- Complex widget gets its own folder
        ├── index.tsx (renamed MeetingMinutesView)
        └── MeetingMinutesSection.tsx
```

This strategy:
1.  Keeps the top-level `analysis/` clean (only entry points).
2.  Groups related sub-components with their parent view in a dedicated folder (`ActionItems/`).
3.  Separates specific logic (`widgets/`) from generic UI (`shared/`).

## Action Plan
1.  **Move Directories:** Move `components/analysis` -> `analysis`, `components/viewer` -> `viewer`, etc.
2.  **Relocate Hooks:** Move `useAnalysis.ts` to `analysis/`, `useFileUpload.ts` to `upload/`.
3.  **Flatten Internals:** Inside `analysis`, flatten `items` and `views` into a single `components` folder or keep main views at root of `analysis`.

## Alternative Considered: Top-Level Features (e.g. `features/transcription-analysis`)

You asked if we should elevate these sub-domains to be distinct top-level features.

**Structure:**
```
src/features/
├── transcription-core/ (types, api)
├── transcription-list/
├── transcription-viewer/
└── transcription-analysis/
```

**Analysis:**
*   **Pros:**
    *   Enforces strict decoupling (cannot easily reach into other components).
    *   Flattest possible structure.
*   **Cons:**
    *   **fragmentation of Bounded Context:** "Transcription" is a single cohesive domain. Splitting it leaks the domain implementation across the entire app.
    *   **Shared State Complexity:** React Query keys, Types, and API services are shared. You would need a "Shared Kernel" feature just for `transcription` types, which increases boilerplate (imports become `@/features/transcription-core/types`).
    *   **Feature Pollution:** `src/features` will become cluttered with many transcription-related folders.

**Recommendation:**
We **strongly recommend** the **Vertical Slicing within Feature** approach (Proposed above).
*   It keeps the Domain cohesive (`features/transcription`).
*   It solves the nesting problem (no `components` wrapper).
*   It keeps related code close (Hooks next to UI).
*   It avoids polluting the global feature namespace.
