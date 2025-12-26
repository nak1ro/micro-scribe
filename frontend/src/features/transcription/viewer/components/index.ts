// TranscriptionViewerNew - Modern redesign of the transcription viewer

export { TranscriptionViewerNew } from "./TranscriptionViewerNew";

// Sub-components (for advanced usage)
export { ViewerHeader } from "./ViewerHeader";
export { ViewerLayout } from "./ViewerLayout";
export { TranscriptContent } from "./TranscriptContent";
export { TranscriptSegment } from "./TranscriptSegment";
export { AudioPlayer } from "./AudioPlayer";
export { ActionsSidebar } from "./ActionsSidebar";
export { LanguageMenu } from "./LanguageMenu";
export { TopicsBadges } from "./TopicsBadges";

// Re-export from analysis folder
export {
    AnalysisMenu,
    TLDRCard,
    ActionItemsView,
    MeetingMinutesView,
    AnalysisContentView,
} from "@/features/transcription/analysis";

// Re-export from export folder
export { ExportMenu } from "@/features/transcription/export";

// Hooks
export { useAudioSync } from "@/features/transcription/hooks/useAudioSync";

// Types
export type {
    TranscriptionData,
    ViewerSegment,
    ViewerState,
    ExportFormat,
    ExportOption,
} from "@/features/transcription/types";
