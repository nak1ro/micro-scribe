"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, Upload, Youtube, Mic, FolderOpen, Trash2, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
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

    // Reset state when modal closes
    React.useEffect(() => {
        if (!isOpen) {
            setFile(null);
            setYoutubeUrl("");
            setAudioBlob(null);
            setActiveTab("file");
            reset();
        }
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
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">
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
// Upload Progress Overlay
// ─────────────────────────────────────────────────────────────

interface UploadProgressOverlayProps {
    status: UploadStatus;
    progress: number;
    onCancel: () => void;
}

function UploadProgressOverlay({ status, progress, onCancel }: UploadProgressOverlayProps) {
    const getStatusMessage = () => {
        switch (status) {
            case "initiating":
                return "Preparing upload...";
            case "uploading":
                return `Uploading file... ${progress}%`;
            case "completing":
                return "Finishing upload...";
            case "validating":
                return "Validating file...";
            case "creating-job":
                return "Creating transcription...";
            default:
                return "Processing...";
        }
    };

    const canCancel = status === "uploading";

    return (
        <div className="p-6">
            <div className="flex flex-col items-center gap-6 py-8">
                {/* Spinner or progress indicator */}
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-muted flex items-center justify-center">
                        {status === "uploading" ? (
                            <span className="text-xl font-bold text-primary">{progress}%</span>
                        ) : (
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        )}
                    </div>
                    {/* Progress ring for uploading */}
                    {status === "uploading" && (
                        <svg
                            className="absolute inset-0 -rotate-90"
                            width="80"
                            height="80"
                            viewBox="0 0 80 80"
                        >
                            <circle
                                cx="40"
                                cy="40"
                                r="36"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="text-primary"
                                strokeDasharray={`${2 * Math.PI * 36}`}
                                strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
                                strokeLinecap="round"
                            />
                        </svg>
                    )}
                </div>

                {/* Status message */}
                <div className="text-center">
                    <p className="font-semibold text-foreground">{getStatusMessage()}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {canCancel ? "You can cancel the upload" : "Please don't close this window"}
                    </p>
                </div>

                {/* Cancel button (only during upload phase) */}
                {canCancel && (
                    <Button variant="ghost" onClick={onCancel}>
                        Cancel Upload
                    </Button>
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

// ─────────────────────────────────────────────────────────────
// Voice Recording Tab
// ─────────────────────────────────────────────────────────────

interface VoiceRecordingTabProps {
    audioBlob: Blob | null;
    onRecordingComplete: (blob: Blob) => void;
    onClear: () => void;
}

function VoiceRecordingTab({ audioBlob, onRecordingComplete, onClear }: VoiceRecordingTabProps) {
    const [isRecording, setIsRecording] = React.useState(false);
    const [recordingTime, setRecordingTime] = React.useState(0);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const chunksRef = React.useRef<Blob[]>([]);
    const timerRef = React.useRef<number | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                onRecordingComplete(blob);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = window.setInterval(() => {
                setRecordingTime((t) => t + 1);
            }, 1000);
        } catch (err) {
            console.error("Failed to start recording:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mic className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-foreground">Voice Recording</p>
                        <p className="text-sm text-muted-foreground">
                            {formatFileSize(audioBlob.size)}
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
                <audio controls src={audioUrl} className="w-full" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-12 gap-6">
            <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center transition-all",
                    isRecording
                        ? "bg-destructive text-destructive-foreground animate-pulse"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                )}
            >
                <Mic className="h-10 w-10" />
            </button>

            <div className="text-center">
                {isRecording ? (
                    <>
                        <p className="text-lg font-semibold text-destructive">
                            Recording... {formatTime(recordingTime)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Click to stop recording
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-lg font-semibold text-foreground">
                            Press to start recording
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Your microphone will be used
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
