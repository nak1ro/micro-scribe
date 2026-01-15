"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Xmark, CloudUpload, Youtube, Microphone, CheckCircle, WarningCircle, Crown, Lock } from "iconoir-react";
import { Button } from "@/components/ui";
import { VoiceRecordingTab } from "./VoiceRecordingTab";
import { UploadProgressOverlay } from "./UploadProgressOverlay";
import { TabButton } from "./TabButton";
import { MultiFileUploadTab } from "./MultiFileUploadTab";
import { YouTubeTab } from "./YouTubeTab";
import { SOURCE_LANGUAGES, TRANSCRIPTION_QUALITY_OPTIONS, SUPPORTED_FORMATS } from "./constants";
import { TranscriptionQuality } from "@/features/transcription/types";
import { useFileUpload } from "@/features/transcription/hooks/useFileUpload";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { PLANS } from "@/lib/plans";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type TabType = "file" | "youtube" | "voice";

interface CreateTranscriptionModalProps {
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

export interface TranscriptionFormData {
    type: TabType;
    file?: File;
    youtubeUrl?: string;
    audioBlob?: Blob;
    sourceLanguage: string;
    quality: TranscriptionQuality;
    enableSpeakerDiarization: boolean;
}



// ─────────────────────────────────────────────────────────────
// Main Modal Component
// ─────────────────────────────────────────────────────────────

export function CreateTranscriptionModal({
    isOpen,
    onClose,
    onSuccess,
    onOptimisticAdd,
    onOptimisticUpdate,
    onOptimisticRemove,
}: CreateTranscriptionModalProps) {
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

    // Reset state when modal opens or closes
    React.useEffect(() => {
        setFiles([]);
        setFileErrors(new Map());
        setYoutubeUrl("");
        setAudioBlob(null);
        setActiveTab("file");
        setEnableSpeakerDiarization(false);
        setGeneralError(null);
        reset();
    }, [isOpen, reset]);

    // Get duration of audio/video file in minutes
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
                resolve(null); // Can't determine duration, let backend handle it
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

    // Remove a specific file from the list
    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        // Remove error for this file if any
        const fileName = files[index]?.name;
        if (fileName) {
            setFileErrors(prev => {
                const next = new Map(prev);
                next.delete(fileName);
                return next;
            });
        }
    };

    // File selection with size and duration validation for multiple files
    const handleFilesSelect = async (selectedFiles: File[], append: boolean = false) => {
        setGeneralError(null);

        // Calculate total files after addition
        const existingCount = append ? files.length : 0;
        const totalAfterAdd = existingCount + selectedFiles.length;

        // Check max files limit
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
            // Check file size
            if (!isFileSizeValid(file.size)) {
                newErrors.set(file.name, `Exceeds ${maxFileSizeMB}MB limit`);
                continue;
            }

            // Check file duration
            const durationMinutes = await getMediaDuration(file);
            if (durationMinutes !== null && durationMinutes > maxMinutesPerFile) {
                newErrors.set(file.name, `Exceeds ${maxMinutesPerFile} min limit`);
                continue;
            }

            newValidFiles.push(file);
        }

        setIsValidatingFiles(false);

        if (append) {
            // Append new files to existing
            setFiles(prev => [...prev, ...newValidFiles]);
            setFileErrors(prev => {
                const merged = new Map(prev);
                newErrors.forEach((v, k) => merged.set(k, v));
                return merged;
            });
        } else {
            // Replace files
            setFiles(newValidFiles);
            setFileErrors(newErrors);
        }
    };

    const handleSubmit = async () => {
        if (!hasContent()) return;

        // Helper to run upload in background with optimistic updates
        const runBackgroundUpload = async (uploadFile: File, index: number) => {
            // Create a unique temporary ID for optimistic item
            const tempId = `temp-${Date.now()}-${index}`;

            // Add optimistic item to list
            onOptimisticAdd?.({
                id: tempId,
                fileName: uploadFile.name,
                uploadDate: new Date().toISOString(),
                status: "uploading",
                duration: null,
                language: sourceLanguage === "auto" ? null : sourceLanguage,
                preview: null,
            });

            // Run upload in background
            try {
                const job = await upload(uploadFile, {
                    sourceLanguage: sourceLanguage === "auto" ? undefined : sourceLanguage,
                    quality,
                    enableSpeakerDiarization,
                }, tempId);

                if (job) {
                    // Upload succeeded - remove optimistic item (server data will appear on refetch)
                    onOptimisticRemove?.(tempId);
                    onSuccess?.();
                } else {
                    // Upload failed - update status to failed
                    onOptimisticUpdate?.(tempId, { status: "failed" });
                }
            } catch {
                // Upload errored - update status to failed
                onOptimisticUpdate?.(tempId, { status: "failed" });
            }
        };


        if (activeTab === "file" && files.length > 0) {
            // Close modal and reset immediately, then upload all files in parallel
            onClose();
            reset();

            // Upload all valid files in parallel
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

    if (!isOpen) return null;

    const showUploadProgress = activeTab === "file" && isUploading;
    const showError = status === "error";
    const showSuccess = status === "success";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={isUploading ? undefined : onClose}
            />

            {/* Modal */}
            <div
                className={cn(
                    "relative w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto",
                    "sm:max-w-2xl sm:mx-4",
                    "bg-card border-t sm:border border-border sm:rounded-2xl shadow-2xl",
                    "animate-fade-in flex flex-col"
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 id="modal-title" className="text-xl font-semibold text-foreground">
                        Create Transcription
                    </h2>
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isUploading && status !== "uploading"}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent disabled:opacity-50"
                    >
                        <Xmark className="h-5 w-5" />
                    </button>
                </div>

                {/* Upload Progress Overlay */}
                {showUploadProgress && (
                    <UploadProgressOverlay
                        status={status}
                        progress={progress}
                        onCancel={abort}
                    />
                )}

                {/* Error State */}
                {showError && (
                    <div className="p-6">
                        <div className="flex flex-col items-center gap-4 py-8">
                            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                                <WarningCircle className="h-8 w-8 text-destructive" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-foreground mb-1">Upload Failed</p>
                                <p className="text-sm text-muted-foreground">{error}</p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={onClose}>
                                    Close
                                </Button>
                                <Button onClick={handleRetry}>
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {showSuccess && (
                    <div className="p-6">
                        <div className="flex flex-col items-center gap-4 py-8">
                            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-success" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-foreground mb-1">Transcription Started!</p>
                                <p className="text-sm text-muted-foreground">
                                    Your file is being transcribed. You'll see it in your list shortly.
                                </p>
                            </div>
                            <Button onClick={onClose}>
                                Done
                            </Button>
                        </div>
                    </div>
                )}

                {/* Normal Form State */}
                {!showUploadProgress && !showError && !showSuccess && (
                    <>
                        {/* Tabs */}
                        <div className="flex border-b border-border">
                            <TabButton
                                active={activeTab === "file"}
                                onClick={() => setActiveTab("file")}
                                icon={CloudUpload}
                                label="Media File"
                            />
                            <TabButton
                                active={activeTab === "youtube"}
                                onClick={() => setActiveTab("youtube")}
                                icon={Youtube}
                                label="YouTube Link"
                                disabled={true}
                                badge="Coming Soon"
                            />
                            <TabButton
                                active={activeTab === "voice"}
                                onClick={() => setActiveTab("voice")}
                                icon={Microphone}
                                label="Voice Recording"
                            />
                        </div>

                        {/* Tab Content */}
                        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
                            {/* Usage limit warning for Free users */}
                            {!isPro && dailyLimit !== null && (
                                <div className={cn(
                                    "mb-4 p-3 rounded-lg flex items-center gap-3",
                                    remainingToday === 0
                                        ? "bg-destructive/10 border border-destructive/20"
                                        : "bg-warning/10 border border-warning/20"
                                )}>
                                    <Crown className={cn(
                                        "h-5 w-5 shrink-0",
                                        remainingToday === 0 ? "text-destructive" : "text-warning"
                                    )} />
                                    <div className="flex-1 text-sm">
                                        {remainingToday === 0 ? (
                                            <span className="text-destructive font-medium">
                                                Daily limit reached. <Link href="/pricing" className="underline hover:no-underline">Upgrade to Pro</Link> for unlimited transcriptions.
                                            </span>
                                        ) : (
                                            <span className="text-foreground">
                                                <span className="font-medium">{remainingToday}/{dailyLimit}</span> free transcriptions remaining today.
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* General error (like max files exceeded) */}
                            {generalError && (
                                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                                    <WarningCircle className="h-5 w-5 text-destructive shrink-0" />
                                    <span className="text-sm text-destructive">{generalError}</span>
                                </div>
                            )}

                            {/* File validation errors */}
                            {fileErrors.size > 0 && (
                                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <WarningCircle className="h-4 w-4 text-destructive shrink-0" />
                                        <span className="text-sm font-medium text-destructive">Some files couldn't be added:</span>
                                    </div>
                                    <ul className="text-sm text-destructive/80 space-y-1 ml-6">
                                        {Array.from(fileErrors.entries()).map(([name, error]) => (
                                            <li key={name}>{name}: {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {activeTab === "file" && (
                                <MultiFileUploadTab
                                    files={files}
                                    onFilesSelect={handleFilesSelect}
                                    onRemoveFile={handleRemoveFile}
                                    onClear={handleClear}
                                    maxFilesPerUpload={maxFilesPerUpload}
                                    isValidating={isValidatingFiles}
                                />
                            )}
                            {activeTab === "youtube" && (
                                <YouTubeTab
                                    url={youtubeUrl}
                                    onUrlChange={setYoutubeUrl}
                                    onClear={handleClear}
                                />
                            )}
                            {activeTab === "voice" && (
                                <VoiceRecordingTab
                                    audioBlob={audioBlob}
                                    onRecordingComplete={setAudioBlob}
                                    onClear={handleClear}
                                />
                            )}

                            {/* Options */}
                            <div className="mt-6 pt-6 border-t border-border space-y-4">
                                {/* Source Language */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-foreground">
                                        Language
                                    </label>
                                    <select
                                        value={sourceLanguage}
                                        onChange={(e) => setSourceLanguage(e.target.value)}
                                        className={cn(
                                            "w-full h-12 sm:h-10 px-3 rounded-md",
                                            "bg-background border border-input",
                                            "text-base sm:text-sm text-foreground",
                                            "focus:outline-none focus:ring-2 focus:ring-ring"
                                        )}
                                    >
                                        {SOURCE_LANGUAGES.map((lang) => (
                                            <option key={lang.code} value={lang.code}>
                                                {lang.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Speaker Diarization */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <label className="text-sm font-medium text-foreground min-w-[100px]">
                                        Speakers
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setEnableSpeakerDiarization(!enableSpeakerDiarization)}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                                            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                            enableSpeakerDiarization ? "bg-primary" : "bg-muted"
                                        )}
                                        role="switch"
                                        aria-checked={enableSpeakerDiarization}
                                    >
                                        <span
                                            className={cn(
                                                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition",
                                                enableSpeakerDiarization ? "translate-x-5" : "translate-x-0"
                                            )}
                                        />
                                    </button>
                                    <span className="text-sm text-muted-foreground">
                                        Identify different speakers
                                    </span>
                                </div>

                                {/* Quality */}
                                <div className="flex flex-col gap-2 sm:gap-4">
                                    <label className="text-sm font-medium text-foreground">
                                        Model Speed
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        {TRANSCRIPTION_QUALITY_OPTIONS.map((opt) => {
                                            const isRestricted = !limits.allModels && opt.value !== TranscriptionQuality.Balanced;
                                            const isSelected = quality === opt.value;

                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => !isRestricted && setQuality(opt.value)}
                                                    disabled={isRestricted}
                                                    className={cn(
                                                        "flex-1 px-3 py-2 rounded-md text-sm border transition-all relative",
                                                        "flex flex-col items-start gap-0.5",
                                                        isSelected
                                                            ? "border-primary bg-primary/10 text-primary"
                                                            : "border-input bg-background text-muted-foreground",
                                                        !isSelected && !isRestricted && "hover-subtle hover:border-primary/50",
                                                        isRestricted && "opacity-50 cursor-not-allowed bg-muted border-transparent"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-1.5 w-full">
                                                        <span className="font-medium">{opt.label}</span>
                                                        {isRestricted && <Lock className="h-3.5 w-3.5 ml-auto" />}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground text-left">{opt.description}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 p-4 sm:p-6 border-t border-border mt-auto">
                            <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!hasContent() || !canTranscribe() || !!generalError || isValidatingFiles}
                                className="w-full sm:w-auto sm:min-w-[120px]"
                            >
                                Transcribe
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
