import * as React from "react";
import { TranscriptionQuality } from "@/features/transcription/types";
import { useFileUpload } from "./useFileUpload";
import { usePlanLimits } from "@/hooks/usePlanLimits";

export type TabType = "file" | "youtube" | "voice";

interface UseCreateTranscriptionProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    onOptimisticAdd?: (item: {
        id: string;
        fileName: string;
        uploadDate: string;
        status: "uploading";
        duration: number | null;
        language: string | null;
        preview: string | null;
    }) => void;
    onOptimisticUpdate?: (id: string, updates: { status: "pending" | "failed" }) => void;
    onOptimisticRemove?: (id: string) => void;
}

export function useCreateTranscription({
    isOpen,
    onClose,
    onSuccess,
    onOptimisticAdd,
    onOptimisticUpdate,
    onOptimisticRemove,
}: UseCreateTranscriptionProps) {
    const [activeTab, setActiveTab] = React.useState<TabType>("file");
    const [files, setFiles] = React.useState<File[]>([]);
    const [fileErrors, setFileErrors] = React.useState<Map<string, string>>(new Map());
    const [youtubeUrl, setYoutubeUrl] = React.useState("");
    const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
    const [sourceLanguage, setSourceLanguage] = React.useState("auto");
    const [quality, setQuality] = React.useState<TranscriptionQuality>(TranscriptionQuality.Balanced);
    const [enableSpeakerDiarization, setEnableSpeakerDiarization] = React.useState(false);
    const [generalError, setGeneralError] = React.useState<string | null>(null);
    const [isValidatingFiles, setIsValidatingFiles] = React.useState(false);

    const { upload, abort, reset, progress, status, error, isUploading } = useFileUpload();
    const { isPro, remainingToday, dailyLimit, canTranscribe, isFileSizeValid, maxFileSizeMB, maxMinutesPerFile, limits } = usePlanLimits();
    const maxFilesPerUpload = limits.maxFilesPerUpload;

    // Reset state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setFiles([]);
            setFileErrors(new Map());
            setYoutubeUrl("");
            setAudioBlob(null);
            setActiveTab("file");
            setEnableSpeakerDiarization(false);
            setGeneralError(null);
            setSourceLanguage("auto");
            setQuality(TranscriptionQuality.Balanced);
            reset();
        }
    }, [isOpen, reset]);

    const getMediaDuration = (file: File): Promise<number | null> => {
        return new Promise((resolve) => {
            const url = URL.createObjectURL(file);
            const media = file.type.startsWith("video/")
                ? document.createElement("video")
                : document.createElement("audio");

            media.onloadedmetadata = () => {
                URL.revokeObjectURL(url);
                const durationMinutes = media.duration / 60;
                resolve(isFinite(durationMinutes) ? durationMinutes : null);
            };

            media.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(null);
            };

            media.src = url;
        });
    };

    const hasContent = () => {
        switch (activeTab) {
            case "file":
                return files.length > 0;
            case "youtube":
                return youtubeUrl.trim().length > 0;
            case "voice":
                return audioBlob !== null;
            default:
                return false;
        }
    };

    const handleClear = () => {
        setGeneralError(null);
        setFileErrors(new Map());
        switch (activeTab) {
            case "file":
                setFiles([]);
                break;
            case "youtube":
                setYoutubeUrl("");
                break;
            case "voice":
                setAudioBlob(null);
                break;
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        const fileName = files[index]?.name;
        if (fileName) {
            setFileErrors(prev => {
                const next = new Map(prev);
                next.delete(fileName);
                return next;
            });
        }
    };

    const handleFilesSelect = async (selectedFiles: File[], append: boolean = false) => {
        setGeneralError(null);

        const existingCount = append ? files.length : 0;
        const totalAfterAdd = existingCount + selectedFiles.length;

        if (totalAfterAdd > maxFilesPerUpload) {
            setGeneralError(
                `You can upload up to ${maxFilesPerUpload} file${maxFilesPerUpload > 1 ? "s" : ""} at once. ${!isPro ? "Upgrade to Pro for up to 20 files." : ""}`
            );
            return;
        }

        setIsValidatingFiles(true);
        const newValidFiles: File[] = [];
        const newErrors = new Map<string, string>();

        for (const file of selectedFiles) {
            if (!isFileSizeValid(file.size)) {
                newErrors.set(file.name, `Exceeds ${maxFileSizeMB}MB limit`);
                continue;
            }

            const durationMinutes = await getMediaDuration(file);
            if (durationMinutes !== null && durationMinutes > maxMinutesPerFile) {
                newErrors.set(file.name, `Exceeds ${maxMinutesPerFile} min limit`);
                continue;
            }

            newValidFiles.push(file);
        }

        setIsValidatingFiles(false);

        if (append) {
            setFiles(prev => [...prev, ...newValidFiles]);
            setFileErrors(prev => {
                const merged = new Map(prev);
                newErrors.forEach((v, k) => merged.set(k, v));
                return merged;
            });
        } else {
            setFiles(newValidFiles);
            setFileErrors(newErrors);
        }
    };

    const handleSubmit = async () => {
        if (!hasContent()) return;

        const runBackgroundUpload = async (uploadFile: File, index: number) => {
            const tempId = `temp-${Date.now()}-${index}`;

            onOptimisticAdd?.({
                id: tempId,
                fileName: uploadFile.name,
                uploadDate: new Date().toISOString(),
                status: "uploading",
                duration: null,
                language: sourceLanguage === "auto" ? null : sourceLanguage,
                preview: null,
            });

            try {
                const job = await upload(uploadFile, {
                    sourceLanguage: sourceLanguage === "auto" ? undefined : sourceLanguage,
                    quality,
                    enableSpeakerDiarization,
                }, tempId);

                if (job) {
                    onOptimisticRemove?.(tempId);
                    onSuccess?.();
                } else {
                    onOptimisticUpdate?.(tempId, { status: "failed" });
                }
            } catch {
                onOptimisticUpdate?.(tempId, { status: "failed" });
            }
        };

        if (activeTab === "file" && files.length > 0) {
            onClose();
            reset();
            files.forEach((file, index) => {
                runBackgroundUpload(file, index);
            });
        } else if (activeTab === "youtube") {
            // TODO: Implement YouTube handling
        } else if (activeTab === "voice" && audioBlob) {
            onClose();
            reset();
            const voiceFile = new File([audioBlob], "voice-recording.webm", {
                type: "audio/webm",
            });
            runBackgroundUpload(voiceFile, 0);
        }
    };

    const handleCancel = () => {
        if (isUploading) {
            abort();
        } else {
            onClose();
        }
    };

    const handleRetry = () => {
        reset();
    };

    return {
        // State
        activeTab,
        files,
        fileErrors,
        youtubeUrl,
        audioBlob,
        sourceLanguage,
        quality,
        enableSpeakerDiarization,
        generalError,
        isValidatingFiles,
        isUploading,
        progress,
        status,
        error,

        // Limits/Info
        isPro,
        remainingToday,
        dailyLimit,
        canTranscribe,
        maxFilesPerUpload,
        limits,

        // Setters
        setActiveTab,
        setYoutubeUrl,
        setAudioBlob,
        setSourceLanguage,
        setQuality,
        setEnableSpeakerDiarization,

        // Handlers
        handleFilesSelect,
        handleRemoveFile,
        handleClear,
        handleSubmit,
        handleCancel,
        handleRetry,
        hasContent,
        abort
    };
}
