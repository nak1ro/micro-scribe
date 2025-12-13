import { UploadOptions } from "@/types/models/upload";

/**
 * Configuration for the upload orchestrator.
 * All values have sensible defaults.
 */
export interface UploadConfig {
    /** Chunk size in bytes for multipart upload. Default: 5MB (S3 minimum) */
    chunkSize: number;
    /** Maximum retry attempts for failed requests. Default: 3 */
    maxRetries: number;
    /** Base delay in ms for exponential backoff. Default: 1000 */
    retryBaseDelayMs: number;
    /** Interval in ms between validation polls. Default: 2000 */
    pollIntervalMs: number;
    /** Maximum poll attempts before timeout. Default: 60 (2 min) */
    maxPollAttempts: number;
}

/**
 * Default upload configuration values.
 */
export const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
    chunkSize: 5 * 1024 * 1024, // 5MB - S3 multipart minimum
    maxRetries: 3,
    retryBaseDelayMs: 1000,
    pollIntervalMs: 2000,
    maxPollAttempts: 60,
};

/**
 * Progress callback signature for upload tracking.
 */
export type UploadProgressCallback = (percent: number) => void;

/**
 * Status callback signature for stage updates.
 */
export type UploadStatusCallback = (status: UploadStage) => void;

/**
 * Stages of the upload orchestration process.
 */
export type UploadStage =
    | "initiating"
    | "uploading"
    | "completing"
    | "validating"
    | "creating-job";

/**
 * Input for the upload orchestration process.
 */
export interface UploadInput {
    file: File;
    options?: UploadOptions;
    config?: Partial<UploadConfig>;
    signal?: AbortSignal;
    onProgress?: UploadProgressCallback;
    onStatusChange?: UploadStatusCallback;
}
