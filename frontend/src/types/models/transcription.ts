// Transcription types for the frontend

// Status for transcription jobs
export type TranscriptionStatus =
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled";

// Transcription list item for UI display
export interface TranscriptionListItem {
    id: string;
    fileName: string;
    uploadDate: string;
    status: TranscriptionStatus;
    duration: number | null;
    language: string | null;
}

// Filter options for transcription list
export interface TranscriptionFilters {
    search?: string;
    status?: TranscriptionStatus;
}
