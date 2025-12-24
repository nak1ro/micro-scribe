

// Local types for TranscriptionViewerNew
// Re-exports relevant types from API

export type {
    TranscriptSegmentDto,
    TranscriptionJobDetailResponse,
    TranscriptionJobStatus,
    TranscriptionSpeakerDto,
    TranslateJobRequest,
} from "@/types/api/transcription";

// Viewer-specific types
export interface ViewerSegment {
    id: string;
    text: string;
    startSeconds: number;
    endSeconds: number;
    speaker: string | null;
    translatedText: string | null;
    isEdited: boolean;
}

export interface ViewerState {
    activeSegmentIndex: number;
    isPlaying: boolean;
    currentTime: number;
    showTimecodes: boolean;
    showSpeakers: boolean;
}

// Speaker metadata for UI
export interface SpeakerInfo {
    id: string;
    displayName: string | null;
    color: string | null;
}

export interface TranscriptionData {
    id: string;
    fileName: string;
    status: "pending" | "processing" | "completed" | "failed";
    durationSeconds: number;
    sourceLanguage: string;
    targetLanguage: string | null;
    enableSpeakerDiarization: boolean;
    speakers: SpeakerInfo[];
    segments: ViewerSegment[];
    audioUrl: string | null;
}

export type ExportFormat = "txt" | "docx" | "srt" | "csv" | "mp3";

export interface ExportOption {
    id: ExportFormat;
    label: string;
    description: string;
    icon: string;
}

