// ─────────────────────────────────────────────────────────────
// Media File Types
// ─────────────────────────────────────────────────────────────

export enum MediaFileType {
    Audio = 0,
    Video = 1,
}

export interface MediaFileResponse {
    id: string;
    originalFileName: string;
    sizeBytes: number;
    contentType: string;
    fileType: MediaFileType;
    durationSeconds: number | null;
    normalizedAudioObjectKey: string | null;
    createdAtUtc: string;
}

// ─────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────

export interface PagedResponse<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

// ─────────────────────────────────────────────────────────────
// Upload Session Types
// ─────────────────────────────────────────────────────────────

export interface InitiateUploadRequest {
    fileName: string;
    contentType: string;
    sizeBytes: number;
    clientRequestId?: string;
}

export interface UploadSessionResponse {
    id: string;
    status: string;
    uploadUrl: string | null;
    uploadId: string | null;
    key: string;
    initialChunkSize: number;
    expiresAtUtc: string;
    correlationId: string;
}

export interface CompleteUploadRequest {
    parts?: PartETagDto[] | null;
}

export interface PartETagDto {
    partNumber: number;
    eTag: string;
}

export interface UploadSessionStatusResponse {
    id: string;
    status: UploadSessionStatus;
    errorMessage: string | null;
    createdAtUtc: string;
    uploadedAtUtc: string | null;
    validatedAtUtc: string | null;
}

export type UploadSessionStatus =
    | "Created"
    | "Uploading"
    | "Uploaded"
    | "Validating"
    | "Ready"
    | "Invalid"
    | "Aborted"
    | "Expired";

// ─────────────────────────────────────────────────────────────
// Transcription Types
// ─────────────────────────────────────────────────────────────

export enum TranscriptionJobStatus {
    Pending = "Pending",
    Processing = "Processing",
    Completed = "Completed",
    Failed = "Failed",
    Cancelled = "Cancelled",
}

export enum TranscriptionQuality {
    Fast = 0,
    Balanced = 1,
    Accurate = 2,
}

export interface CreateTranscriptionJobRequest {
    mediaFileId?: string;
    uploadSessionId?: string;
    quality?: TranscriptionQuality;
    languageCode?: string | null;
}

export interface TranscriptionJobResponse {
    jobId: string;
    mediaFileId: string;
    status: TranscriptionJobStatus;
    createdAtUtc: string;
}

// List item for paginated job list response
export interface TranscriptionJobListItem {
    jobId: string;
    originalFileName: string;
    status: TranscriptionJobStatus;
    quality: TranscriptionQuality;
    languageCode: string | null;
    durationSeconds: number | null;
    createdAtUtc: string;
    completedAtUtc: string | null;
}

export interface TranscriptionJobDetailResponse {
    jobId: string;
    mediaFileId: string;
    originalFileName: string;
    status: TranscriptionJobStatus;
    quality: TranscriptionQuality;
    languageCode: string | null;
    transcript: string | null;
    errorMessage: string | null;
    durationSeconds: number | null;
    segments: TranscriptSegmentDto[];
    createdAtUtc: string;
    startedAtUtc: string | null;
    completedAtUtc: string | null;
}

export interface TranscriptSegmentDto {
    id: string;
    text: string;
    startSeconds: number;
    endSeconds: number;
    speaker: string | null;
    order: number;
    isEdited: boolean;
    originalText: string | null;
}

export interface UpdateSegmentRequest {
    text: string;
}

export enum ExportFormat {
    Txt = 0,
    Srt = 1,
    Vtt = 2,
    Docx = 3,
    Pdf = 4,
}
