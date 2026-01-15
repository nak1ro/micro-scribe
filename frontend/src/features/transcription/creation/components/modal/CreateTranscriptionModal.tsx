"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Xmark, CloudUpload, Youtube, Microphone, CheckCircle, WarningCircle, Crown, Lock } from "iconoir-react";
import { Button } from "@/components/ui";
import { VoiceRecordingTab } from "../tabs/VoiceRecordingTab";
import { UploadProgressOverlay } from "../upload/UploadProgressOverlay";
import { TabButton } from "./TabButton";
import { MultiFileUploadTab } from "../tabs/MultiFileUploadTab";
import { YouTubeTab } from "../tabs/YouTubeTab";
import { SOURCE_LANGUAGES, TRANSCRIPTION_QUALITY_OPTIONS, SUPPORTED_FORMATS } from "../../constants";
import { TranscriptionQuality } from "@/features/transcription/types";
import { useCreateTranscription, TabType } from "../../hooks/useCreateTranscription";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────



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

// ─────────────────────────────────────────────────────────────
// Main Modal Component
// ─────────────────────────────────────────────────────────────

export function CreateTranscriptionModal(props: CreateTranscriptionModalProps) {
    const {
        isOpen,
        onClose,
    } = props;

    const {
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
    } = useCreateTranscription(props);

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
                                            const isRestricted = !limits.allModels && opt.value === TranscriptionQuality.Accurate;
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
