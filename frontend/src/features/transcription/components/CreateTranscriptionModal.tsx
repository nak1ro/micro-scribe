"use client";

import * as React from "react";
import { cn, formatFileSize } from "@/lib/utils";
import { X, Upload, Youtube, Mic, FolderOpen, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { VoiceRecordingTab } from "./VoiceRecordingTab";
import { UploadProgressOverlay } from "./UploadProgressOverlay";
import { TranscriptionQuality } from "@/types/api/transcription";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { UploadStatus } from "@/types/models/upload";

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
    languageCode: string;
    quality: TranscriptionQuality;
}

// ─────────────────────────────────────────────────────────────
// Languages & Quality Options
// ─────────────────────────────────────────────────────────────

const LANGUAGES = [
    { code: "auto", label: "Auto-detect" },
    { code: "en", label: "English" },
    { code: "pl", label: "Polish" },
    { code: "de", label: "German" },
    { code: "fr", label: "French" },
    { code: "es", label: "Spanish" },
    { code: "it", label: "Italian" },
    { code: "pt", label: "Portuguese" },
    { code: "nl", label: "Dutch" },
    { code: "ru", label: "Russian" },
    { code: "ja", label: "Japanese" },
    { code: "ko", label: "Korean" },
    { code: "zh", label: "Chinese" },
];

const QUALITY_OPTIONS = [
    { value: TranscriptionQuality.Fast, label: "Fast", description: "Quickest results" },
    { value: TranscriptionQuality.Balanced, label: "Balanced", description: "Best trade-off" },
    { value: TranscriptionQuality.Accurate, label: "Most Accurate", description: "Highest quality" },
];

const SUPPORTED_FORMATS = [".mp3", ".mp4", ".m4a", ".mov", ".aac", ".wav", ".ogg", ".opus", ".mpeg", ".wma", ".wmv"];

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
    const [file, setFile] = React.useState<File | null>(null);
    const [youtubeUrl, setYoutubeUrl] = React.useState("");
    const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
    const [languageCode, setLanguageCode] = React.useState("auto");
    const [quality, setQuality] = React.useState<TranscriptionQuality>(TranscriptionQuality.Balanced);

    const { upload, abort, reset, progress, status, error, isUploading } = useFileUpload();

    // Reset state when modal opens or closes
    React.useEffect(() => {
        setFile(null);
        setYoutubeUrl("");
        setAudioBlob(null);
        setActiveTab("file");
        reset();
    }, [isOpen, reset]);

    const hasContent = () => {
        switch (activeTab) {
            case "file":
                return file !== null;
            case "youtube":
                return youtubeUrl.trim().length > 0;
            case "voice":
                return audioBlob !== null;
        }
    };

    const handleClear = () => {
        switch (activeTab) {
            case "file":
                setFile(null);
                break;
            case "youtube":
                setYoutubeUrl("");
                break;
            case "voice":
                setAudioBlob(null);
                break;
        }
    };

    const handleSubmit = async () => {
        if (!hasContent()) return;

        // Helper to run upload in background with optimistic updates
        const runBackgroundUpload = async (uploadFile: File) => {
            // Create a temporary ID for optimistic item
            const tempId = `temp-${Date.now()}`;

            // Add optimistic item to list and close modal immediately
            onOptimisticAdd?.({
                id: tempId,
                fileName: uploadFile.name,
                uploadDate: new Date().toISOString(),
                status: "uploading",
                duration: null,
                language: languageCode === "auto" ? null : languageCode,
                preview: null,
            });

            onClose();
            reset();

            // Run upload in background
            try {
                const job = await upload(uploadFile, {
                    languageCode: languageCode === "auto" ? undefined : languageCode,
                    quality,
                });

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

        if (activeTab === "file" && file) {
            runBackgroundUpload(file);
        } else if (activeTab === "youtube") {
            // TODO: Implement YouTube handling
            console.log("YouTube URL:", youtubeUrl);
        } else if (activeTab === "voice" && audioBlob) {
            const voiceFile = new File([audioBlob], "voice-recording.webm", {
                type: "audio/webm",
            });
            runBackgroundUpload(voiceFile);
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
                    "relative w-full max-w-2xl mx-4",
                    "bg-card border border-border rounded-2xl shadow-2xl",
                    "animate-fade-in"
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
                        <X className="h-5 w-5" />
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
                                <AlertCircle className="h-8 w-8 text-destructive" />
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
                                icon={Upload}
                                label="Media File"
                            />
                            <TabButton
                                active={activeTab === "youtube"}
                                onClick={() => setActiveTab("youtube")}
                                icon={Youtube}
                                label="YouTube Link"
                            />
                            <TabButton
                                active={activeTab === "voice"}
                                onClick={() => setActiveTab("voice")}
                                icon={Mic}
                                label="Voice Recording"
                            />
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === "file" && (
                                <FileUploadTab
                                    file={file}
                                    onFileSelect={setFile}
                                    onClear={handleClear}
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
                                {/* Language */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <label className="text-sm font-medium text-foreground min-w-[100px]">
                                        Language
                                    </label>
                                    <select
                                        value={languageCode}
                                        onChange={(e) => setLanguageCode(e.target.value)}
                                        className={cn(
                                            "flex-1 h-10 px-3 rounded-md",
                                            "bg-background border border-input",
                                            "text-sm text-foreground",
                                            "focus:outline-none focus:ring-2 focus:ring-ring"
                                        )}
                                    >
                                        {LANGUAGES.map((lang) => (
                                            <option key={lang.code} value={lang.code}>
                                                {lang.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quality */}
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                                    <label className="text-sm font-medium text-foreground min-w-[100px] pt-2">
                                        Model Speed
                                    </label>
                                    <div className="flex-1 flex gap-2">
                                        {QUALITY_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setQuality(opt.value)}
                                                className={cn(
                                                    "flex-1 px-3 py-2 rounded-md text-sm border transition-all",
                                                    quality === opt.value
                                                        ? "border-primary bg-primary/10 text-primary"
                                                        : "border-input bg-background text-muted-foreground hover:border-primary/50"
                                                )}
                                            >
                                                <div className="font-medium">{opt.label}</div>
                                                <div className="text-xs opacity-70">{opt.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                            <Button variant="ghost" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!hasContent()}
                                className="min-w-[120px]"
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



// ─────────────────────────────────────────────────────────────
// Tab Button
// ─────────────────────────────────────────────────────────────

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
}

function TabButton({ active, onClick, icon: Icon, label }: TabButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3",
                "text-sm font-medium transition-colors",
                "border-b-2 -mb-[2px]",
                active
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/50"
            )}
        >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}

// ─────────────────────────────────────────────────────────────
// File Upload Tab
// ─────────────────────────────────────────────────────────────

interface FileUploadTabProps {
    file: File | null;
    onFileSelect: (file: File) => void;
    onClear: () => void;
}

function FileUploadTab({ file, onFileSelect, onClear }: FileUploadTabProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            onFileSelect(droppedFile);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            onFileSelect(selectedFile);
        }
    };

    if (file) {
        return (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClear}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>
        );
    }

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
                "flex flex-col items-center justify-center gap-4 py-12 px-6",
                "border-2 border-dashed rounded-xl transition-colors",
                isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
            )}
        >
            <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                    Drag & Drop
                </h3>
                <p className="text-sm text-muted-foreground">
                    Supported formats: {SUPPORTED_FORMATS.join(", ")}
                </p>
            </div>

            <div className="text-muted-foreground">or</div>

            <Button
                variant="outline"
                onClick={() => inputRef.current?.click()}
                className="gap-2"
            >
                <FolderOpen className="h-4 w-4" />
                Browse file
            </Button>

            <input
                ref={inputRef}
                type="file"
                accept={SUPPORTED_FORMATS.join(",")}
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// YouTube Tab
// ─────────────────────────────────────────────────────────────

interface YouTubeTabProps {
    url: string;
    onUrlChange: (url: string) => void;
    onClear: () => void;
}

function YouTubeTab({ url, onUrlChange, onClear }: YouTubeTabProps) {
    const isValidUrl = url.includes("youtube.com") || url.includes("youtu.be");

    return (
        <div className="space-y-4">
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Youtube className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                    type="url"
                    placeholder="Paste YouTube URL here..."
                    value={url}
                    onChange={(e) => onUrlChange(e.target.value)}
                    className={cn(
                        "w-full h-12 pl-10 pr-10 rounded-lg",
                        "bg-background border border-input",
                        "text-foreground placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-ring"
                    )}
                />
                {url && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {url && !isValidUrl && (
                <p className="text-sm text-warning">
                    Please enter a valid YouTube URL
                </p>
            )}

            {url && isValidUrl && (
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Video URL</p>
                    <p className="font-medium text-foreground truncate">{url}</p>
                </div>
            )}
        </div>
    );
}




