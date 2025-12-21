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
export { TranslateMenu } from "./TranslateMenu";

// Hooks
export { useAudioSync } from "./useAudioSync";

// Types
export type {
    TranscriptionData,
    ViewerSegment,
    ViewerState,
    ExportFormat,
    ExportOption,
} from "./types";

// Mock data (for development)
export { mockTranscription, mockTranscriptionNoSpeakers, mockTranscriptionPending } from "./mockData";
