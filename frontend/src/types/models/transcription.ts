// Transcription types for the frontend

// Status for transcription jobs
export type TranscriptionStatus =
    | "uploading"
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
    processingStep?: string | null;
    duration: number | null;
    language: string | null;
    preview: string | null;
}

// Filter options for transcription list
export interface TranscriptionFilters {
    search?: string;
    status?: TranscriptionStatus;
}
