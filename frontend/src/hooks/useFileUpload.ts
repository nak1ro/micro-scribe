"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    orchestrateUpload,
    abortUploadSession,
} from "@/services/upload/uploadOrchestrator";
import { uploadAbortRegistry } from "@/services/upload/uploadAbortRegistry";
import {
    UploadConfig,
    UploadStage,
    DEFAULT_UPLOAD_CONFIG,
    UploadStatus,
    UploadOptions,
} from "@/types/models/upload";
import { TranscriptionJobResponse } from "@/types/api/transcription";

export interface UseFileUploadOptions {
    /** Chunk size in bytes for multipart upload. Default: 5MB */
    chunkSize?: number;
    /** Maximum retry attempts for failed requests. Default: 3 */
    maxRetries?: number;
    /** Interval in ms between validation polls. Default: 2000 */
    pollIntervalMs?: number;
}

export interface UseFileUploadReturn {
    upload: (file: File, options?: UploadOptions, tempId?: string) => Promise<TranscriptionJobResponse | null>;
    abort: () => void;
    reset: () => void;
    progress: number;
    status: UploadStatus;
    error: string | null;
    isUploading: boolean;
}

/**
 * Hook for handling file uploads with progress tracking and abort support.
 * Delegates orchestration to the upload service layer.
 */
export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
    const queryClient = useQueryClient();
    const [progress, setProgress] = React.useState(0);
    const [status, setStatus] = React.useState<UploadStatus>("idle");

    const abortControllerRef = React.useRef<AbortController | null>(null);
    const sessionIdRef = React.useRef<string | null>(null);

    // Build config from options
    const config = React.useMemo<Partial<UploadConfig>>(() => ({
        chunkSize: options.chunkSize ?? DEFAULT_UPLOAD_CONFIG.chunkSize,
        maxRetries: options.maxRetries ?? DEFAULT_UPLOAD_CONFIG.maxRetries,
        pollIntervalMs: options.pollIntervalMs ?? DEFAULT_UPLOAD_CONFIG.pollIntervalMs,
    }), [options.chunkSize, options.maxRetries, options.pollIntervalMs]);

    const isUploading = React.useMemo(
        () => ["initiating", "uploading", "extracting", "completing", "validating", "creating-job"].includes(status),
        [status]
    );

    const reset = React.useCallback(() => {
        setProgress(0);
        setStatus("idle");
        sessionIdRef.current = null;
    }, []);

    const mutation = useMutation({
        mutationFn: async ({ file, uploadOptions, tempId }: { file: File; uploadOptions?: UploadOptions; tempId?: string }) => {
            abortControllerRef.current = new AbortController();

            // Register with abort registry if tempId provided
            if (tempId) {
                uploadAbortRegistry.register(tempId, abortControllerRef.current);
            }

            return orchestrateUpload({
                file,
                options: uploadOptions,
                config,
                signal: abortControllerRef.current.signal,
                onProgress: setProgress,
                onStatusChange: (stage: UploadStage) => setStatus(stage),
            });
        },
        onSuccess: (_, variables) => {
            // Unregister from abort registry
            if (variables.tempId) {
                uploadAbortRegistry.unregister(variables.tempId);
            }
            setStatus("success");
            queryClient.invalidateQueries({ queryKey: ["transcriptions"] });
        },
        onError: (err, variables) => {
            // Unregister from abort registry
            if (variables.tempId) {
                uploadAbortRegistry.unregister(variables.tempId);
            }
            if (abortControllerRef.current?.signal.aborted) {
                setStatus("aborted");
            } else {
                setStatus("error");
                console.error("Upload error:", err);
            }
        },
    });

    const upload = React.useCallback(
        async (file: File, uploadOptions?: UploadOptions, tempId?: string): Promise<TranscriptionJobResponse | null> => {
            reset();
            try {
                return await mutation.mutateAsync({ file, uploadOptions, tempId });
            } catch {
                return null;
            }
        },
        [mutation, reset]
    );

    const abort = React.useCallback(async () => {
        abortControllerRef.current?.abort();

        if (sessionIdRef.current) {
            await abortUploadSession(sessionIdRef.current);
        }

        setStatus("aborted");
        sessionIdRef.current = null;
    }, []);

    return {
        upload,
        abort,
        reset,
        progress,
        status,
        error: mutation.error?.message ?? null,
        isUploading,
    };
}
