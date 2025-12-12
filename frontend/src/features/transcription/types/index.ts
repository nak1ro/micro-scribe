// Feature Types
export interface TranscriptionListItem {
    id: string;
    fileName: string;
    uploadDate: string;
    status: TranscriptionStatus;
    duration: number | null;
    language: string | null;
}

export type TranscriptionStatus =
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled";

export interface TranscriptionFilters {
    search?: string;
    status?: TranscriptionStatus;
}
