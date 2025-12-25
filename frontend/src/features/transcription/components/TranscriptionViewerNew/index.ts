// TranscriptionViewerNew - Modern redesign of the transcription viewer

export { TranscriptionViewerNew } from "./TranscriptionViewerNew";

// Sub-components (for advanced usage)
export { ViewerHeader } from "./ViewerHeader";
export { ViewerLayout } from "./ViewerLayout";
export { TranscriptContent } from "./TranscriptContent";
export { TranscriptSegment } from "./TranscriptSegment";
export { AudioPlayer } from "./AudioPlayer";
export { ActionsSidebar } from "./ActionsSidebar";
export { ExportMenu } from "./ExportMenu";
export { LanguageMenu } from "./LanguageMenu";

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
