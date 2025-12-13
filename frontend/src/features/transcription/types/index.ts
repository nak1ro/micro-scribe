// Re-export from shared types
export type { TranscriptionListItem } from "@/types/models/transcription";

// Feature-specific types
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
