import { transcriptionApi } from "@/services/transcription/api";
import { audioExtractor } from "@/services/media/audioExtractor";
import {
    UploadSessionResponse,
    PartETagDto,
    TranscriptionQuality,
    TranscriptionJobResponse,
} from "@/types/api/transcription";
import {
    UploadConfig,
    UploadInput,
    DEFAULT_UPLOAD_CONFIG,
} from "@/types/models/upload";

/**
 * Orchestrates the complete file upload flow:
 * 1. Initiate upload session
 * 2. Upload file to S3 (single or multipart)
 * 3. Complete upload
 * 4. Poll for validation
 * 5. Create transcription job
 */
export async function orchestrateUpload(
    input: UploadInput
): Promise<TranscriptionJobResponse> {
    const {
        file,
        options,
        config: configOverrides,
        signal,
        onProgress,
        onStatusChange,
    } = input;

    const config: UploadConfig = { ...DEFAULT_UPLOAD_CONFIG, ...configOverrides };

    // Step 0: Extract/Normalize Audio (Client-side)
    onStatusChange?.("extracting");

    // Normalize audio/video to MP3 16kHz Mono 64kbps
    // This reduces file size significantly and ensures compatibility
    let fileToUpload: File | Blob = file;
    try {
        const extractedBlob = await audioExtractor.extractAudio(file, (progress) => {
            // We can optionally report extraction progress here, 
            // but let's keep it simple for now or map 0-50% to extracting??
            // For now, we just stay in "extracting" state.
            console.debug(`Extraction progress: ${progress}%`);
        });

        // Create a new File object from the blob, preserving name (but changin ext)
        const newName = file.name.replace(/\.[^/.]+$/, "") + ".mp3";
        fileToUpload = new File([extractedBlob], newName, { type: "audio/mpeg" });
        console.log(`Audio normalized: ${file.size} -> ${fileToUpload.size} bytes`);
    } catch (err) {
        console.error("Audio extraction failed, falling back to original file:", err);
        // Fallback: If extraction fails (e.g. browser compatibility), try uploading original
        // But throwing might be safer if we want to enforce normalization.
        // Let's warn and proceed for now, or throw?
        // User requested "every file should be converted", so likely we should throw or handle gracefully.
        throw new Error(`Audio processing failed: ${(err as Error).message}`);
    }

    checkAbort(signal);

    // Step 1: Initiate upload session
    onStatusChange?.("initiating");

    // Use consistent content type for both signing and upload
    const contentType = fileToUpload.type || "application/octet-stream";

    const session = await transcriptionApi.initiateUpload({
        fileName: fileToUpload instanceof File ? fileToUpload.name : "audio.mp3",
        contentType,
        sizeBytes: fileToUpload.size,
        clientRequestId: crypto.randomUUID(),
    });

    checkAbort(signal);

    // Step 2: Upload file to S3
    onStatusChange?.("uploading");

    let parts: PartETagDto[] | null = null;

    // Backend decides single vs multipart based on its threshold (returns uploadId for multipart)
    // Frontend follows that decision, not its own size comparison
    if (!session.uploadId && session.uploadUrl) {
        // Single-file upload (backend returned presigned PUT URL, no multipart ID)
        await uploadSingleFile(fileToUpload, session.uploadUrl, contentType, config, signal);
        onProgress?.(100);
    } else if (session.uploadId) {
        // Multipart upload (backend initiated multipart and returned uploadId)
        parts = await uploadChunked(fileToUpload, session, config, signal, onProgress);
    } else {
        throw new Error("Invalid session: neither uploadUrl nor uploadId provided");
    }

    checkAbort(signal);

    // Step 3: Complete upload
    onStatusChange?.("completing");
    await transcriptionApi.completeUpload(session.id, { parts });

    // Step 4: Poll for validation
    onStatusChange?.("validating");

    const validationResult = await pollForValidation(session.id, config, signal);

    if (validationResult.status === "Invalid") {
        throw new Error(validationResult.errorMessage || "File validation failed");
    }

    if (validationResult.status !== "Ready") {
        throw new Error(`Unexpected upload status: ${validationResult.status}`);
    }

    // Step 5: Create transcription job
    onStatusChange?.("creating-job");

    const job = await transcriptionApi.createJob({
        uploadSessionId: session.id,
        quality: options?.quality ?? TranscriptionQuality.Balanced,
        languageCode: options?.languageCode || null,
    });

    return job;
}

/**
 * Aborts an upload session on the backend.
 */
export async function abortUploadSession(sessionId: string): Promise<void> {
    try {
        await transcriptionApi.abortUpload(sessionId);
    } catch (e) {
        console.warn("Failed to abort upload session:", e);
    }
}


// Internal helpers

function checkAbort(signal?: AbortSignal): void {
    if (signal?.aborted) {
        throw new Error("Upload aborted");
    }
}

async function uploadSingleFile(
    file: File | Blob,
    presignedUrl: string,
    contentType: string,
    config: UploadConfig,
    signal?: AbortSignal
): Promise<void> {
    await fetchWithRetry(
        presignedUrl,
        {
            method: "PUT",
            body: file,
            headers: { "Content-Type": contentType },
            signal,
        },
        config.maxRetries,
        config.retryBaseDelayMs
    );
}

async function uploadChunked(
    file: File | Blob,
    session: UploadSessionResponse,
    config: UploadConfig,
    signal?: AbortSignal,
    onProgress?: (percent: number) => void
): Promise<PartETagDto[]> {
    const parts: PartETagDto[] = [];
    const totalChunks = Math.ceil(file.size / config.chunkSize);

    for (let i = 0; i < totalChunks; i++) {
        checkAbort(signal);

        const start = i * config.chunkSize;
        const end = Math.min(start + config.chunkSize, file.size);
        const chunk = file.slice(start, end);
        const partNumber = i + 1;

        const chunkUrl = buildChunkUrl(session, partNumber);
        const eTag = await uploadChunkWithRetry(chunk, chunkUrl, partNumber, config, signal);

        parts.push({ partNumber, eTag });
        onProgress?.(Math.round(((i + 1) / totalChunks) * 100));
    }

    return parts;
}

function buildChunkUrl(session: UploadSessionResponse, partNumber: number): string {
    if (session.uploadId && session.uploadUrl) {
        const url = new URL(session.uploadUrl);
        url.searchParams.set("partNumber", String(partNumber));
        url.searchParams.set("uploadId", session.uploadId);
        return url.toString();
    }
    return session.uploadUrl || "";
}

async function uploadChunkWithRetry(
    chunk: Blob,
    url: string,
    partNumber: number,
    config: UploadConfig,
    signal?: AbortSignal
): Promise<string> {
    const response = await fetchWithRetry(
        url,
        { method: "PUT", body: chunk, signal },
        config.maxRetries,
        config.retryBaseDelayMs
    );

    const eTag = response.headers.get("ETag");
    if (!eTag) {
        throw new Error(`No ETag returned for part ${partNumber}`);
    }

    return eTag;
}

async function fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries: number,
    baseDelayMs: number
): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response;
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));

            if (options.signal?.aborted) {
                throw lastError;
            }

            if (attempt === maxRetries) {
                break;
            }

            const delay = baseDelayMs * Math.pow(2, attempt);
            await sleep(delay);
        }
    }

    throw lastError || new Error("Upload failed after retries");
}

async function pollForValidation(
    sessionId: string,
    config: UploadConfig,
    signal?: AbortSignal
): Promise<{ status: string; errorMessage: string | null }> {
    for (let attempt = 0; attempt < config.maxPollAttempts; attempt++) {
        checkAbort(signal);

        const status = await transcriptionApi.getUploadStatus(sessionId);

        if (["Ready", "Invalid", "Failed", "Aborted", "Expired"].includes(status.status)) {
            return { status: status.status, errorMessage: status.errorMessage };
        }

        await sleep(config.pollIntervalMs);
    }

    throw new Error("Validation timed out");
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
