// Transcription list item for UI display

export interface TranscriptionListItem {
    id: string;
    fileName: string;
    uploadDate: string;
    status: "pending" | "processing" | "completed" | "failed" | "cancelled";
    duration: number | null;
    language: string | null;
}
