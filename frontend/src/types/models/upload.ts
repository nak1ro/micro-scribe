// Upload-related types for the frontend

export type UploadStatus =
    | "idle"
    | "initiating"
    | "uploading"
    | "completing"
    | "validating"
    | "creating-job"
    | "success"
    | "error"
    | "aborted";

export interface UploadOptions {
    languageCode?: string;
    quality?: number;
}
