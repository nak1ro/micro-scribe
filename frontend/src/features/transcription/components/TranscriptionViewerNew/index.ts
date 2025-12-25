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
export { AnalysisMenu } from "./AnalysisMenu";
export { TLDRCard } from "./TLDRCard";
export { TopicsBadges } from "./TopicsBadges";
export { ActionItemsView } from "./ActionItemsView";
export { MeetingMinutesView } from "./MeetingMinutesView";

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
