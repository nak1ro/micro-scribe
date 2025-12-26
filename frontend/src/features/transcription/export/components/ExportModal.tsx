"use client";

import * as React from "react";
import { X, Check, RefreshDouble, Plus, Download } from "iconoir-react";
import { Page, TextBox, MediaVideo, Table2Columns, MusicDoubleNote } from "iconoir-react";
import { cn, getLanguageName } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useTranscriptionJob } from "@/hooks/useTranscriptions";
import { transcriptionApi } from "@/services/transcription";
import { handleExport } from "@/features/transcription/utils/exportUtils";
import type { ExportFormat, TranscriptionData } from "@/features/transcription/types";

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
}

// Available languages for translation
const AVAILABLE_LANGUAGES = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "uk", name: "Ukrainian" },
    { code: "ru", name: "Russian" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
];

const EXPORT_FORMATS: { id: ExportFormat; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "txt", label: "Plain Text", description: "Simple text file", icon: Page },
    { id: "docx", label: "Word Document", description: "Microsoft Word format", icon: TextBox },
    { id: "srt", label: "SRT Subtitles", description: "Standard subtitle format", icon: MediaVideo },
    { id: "csv", label: "CSV Spreadsheet", description: "Comma-separated values", icon: Table2Columns },
    { id: "mp3", label: "Audio (MP3)", description: "Download original audio", icon: MusicDoubleNote },
];

export function ExportModal({ isOpen, onClose, jobId }: ExportModalProps) {
    const { data: job, refetch: refetchJob } = useTranscriptionJob(jobId);

    const [selectedFormat, setSelectedFormat] = React.useState<ExportFormat | null>(null);
    const [selectedLanguage, setSelectedLanguage] = React.useState<string | null>(null);
    const [isExporting, setIsExporting] = React.useState(false);
    const [isTranslating, setIsTranslating] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Reset state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setSelectedFormat(null);
            setSelectedLanguage(null);
            setIsExporting(false);
            setIsTranslating(false);
            setError(null);
        }
    }, [isOpen]);

    // Derived data from job
    const sourceLanguage = job?.sourceLanguage || "en";
    const translatedLanguages = job?.translatedLanguages || [];
    const translatingToLanguage = job?.translatingToLanguage;
    const isJobTranslating = job?.translationStatus === "Pending" || job?.translationStatus === "Translating";

    // Languages that can be added (not source, not already translated)
    const untranslatedLanguages = AVAILABLE_LANGUAGES.filter(
        lang => lang.code !== sourceLanguage && !translatedLanguages.includes(lang.code)
    );

    // Close on escape
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isExporting) onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, isExporting, onClose]);

    // Poll for translation completion
    React.useEffect(() => {
        if (!isJobTranslating) {
            setIsTranslating(false);
            return;
        }

        const interval = setInterval(() => {
            refetchJob();
        }, 2000);

        return () => clearInterval(interval);
    }, [isJobTranslating, refetchJob]);

    const handleTranslate = async (langCode: string) => {
        if (isTranslating || isJobTranslating) return;
        setIsTranslating(true);
        setError(null);

        try {
            await transcriptionApi.translateJob(jobId, langCode);
            await refetchJob();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Translation failed";
            setError(message);
            setIsTranslating(false);
        }
    };

    const handleExportClick = async () => {
        if (!selectedFormat || !job) return;

        setIsExporting(true);
        setError(null);

        try {
            // Map job to TranscriptionData format for exportUtils
            const data: TranscriptionData = {
                id: job.jobId,
                fileName: job.originalFileName,
                status: job.status.toLowerCase() as TranscriptionData["status"],
                processingStep: job.processingStep,
                durationSeconds: job.durationSeconds || 0,
                sourceLanguage: job.sourceLanguage || "en",
                translatedLanguages: job.translatedLanguages || [],
                translationStatus: job.translationStatus,
                translatingToLanguage: job.translatingToLanguage,
                enableSpeakerDiarization: job.enableSpeakerDiarization,
                speakers: job.speakers || [],
                segments: job.segments.map((s) => ({
                    id: s.id,
                    text: s.text,
                    startSeconds: s.startSeconds,
                    endSeconds: s.endSeconds,
                    speaker: s.speaker,
                    translations: s.translations || {},
                    isEdited: s.isEdited
                })),
                audioUrl: job.presignedUrl
            };

            await handleExport(selectedFormat, data, selectedLanguage);
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Export failed";
            setError(message);
        } finally {
            setIsExporting(false);
        }
    };

    if (!isOpen) return null;

    const canExport = selectedFormat !== null && !isExporting && !isTranslating && !isJobTranslating;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={isExporting ? undefined : onClose}
            />

            {/* Modal */}
            <div
                className={cn(
                    "relative w-full max-w-lg mx-4",
                    "bg-card border border-border rounded-xl shadow-2xl",
                    "animate-scale-in max-h-[90vh] overflow-hidden flex flex-col"
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby="export-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                            <Download className="h-5 w-5 text-primary" />
                        </div>
                        <h2 id="export-modal-title" className="text-lg font-semibold text-foreground">
                            Export Transcription
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isExporting}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Language Selection - similar to LanguageMenu design */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-foreground">Language</h3>
                        <div className="border border-border rounded-lg overflow-hidden">
                            {/* Source language */}
                            <button
                                onClick={() => setSelectedLanguage(null)}
                                className={cn(
                                    "w-full flex items-center justify-between gap-3 px-4 py-3",
                                    "text-left transition-colors",
                                    selectedLanguage === null ? "bg-primary/5" : "hover:bg-muted"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">
                                        {getLanguageName(sourceLanguage)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">(Original)</span>
                                </div>
                                {selectedLanguage === null && <Check className="h-4 w-4 text-primary" />}
                            </button>

                            {/* Translated languages */}
                            {translatedLanguages.length > 0 && (
                                <>
                                    <div className="h-px bg-border" />
                                    {translatedLanguages.map((langCode) => {
                                        const isSelected = selectedLanguage === langCode;
                                        const isCurrentlyTranslating = translatingToLanguage === langCode;

                                        return (
                                            <button
                                                key={langCode}
                                                onClick={() => setSelectedLanguage(langCode)}
                                                disabled={isCurrentlyTranslating}
                                                className={cn(
                                                    "w-full flex items-center justify-between gap-3 px-4 py-3",
                                                    "text-left transition-colors border-t border-border",
                                                    isSelected ? "bg-primary/5" : "hover:bg-muted",
                                                    isCurrentlyTranslating && "opacity-50"
                                                )}
                                            >
                                                <span className="text-sm text-foreground">
                                                    {getLanguageName(langCode)}
                                                </span>
                                                {isSelected && <Check className="h-4 w-4 text-primary" />}
                                                {isCurrentlyTranslating && (
                                                    <RefreshDouble className="h-4 w-4 text-info animate-spin" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </>
                            )}

                            {/* Add translation section */}
                            {untranslatedLanguages.length > 0 && (
                                <>
                                    <div className="h-px bg-border" />
                                    <div className="px-4 py-2 bg-muted/30">
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Add Translation
                                        </span>
                                    </div>
                                    <div className="max-h-32 overflow-y-auto">
                                        {untranslatedLanguages.map((lang) => {
                                            const isCurrentlyTranslating = translatingToLanguage === lang.code;

                                            return (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => handleTranslate(lang.code)}
                                                    disabled={isTranslating || isJobTranslating}
                                                    className={cn(
                                                        "w-full flex items-center gap-2 px-4 py-2.5",
                                                        "text-left transition-colors border-t border-border",
                                                        (isTranslating || isJobTranslating)
                                                            ? "opacity-50 cursor-not-allowed"
                                                            : "hover:bg-muted cursor-pointer"
                                                    )}
                                                >
                                                    {isCurrentlyTranslating ? (
                                                        <RefreshDouble className="h-3.5 w-3.5 text-info animate-spin" />
                                                    ) : (
                                                        <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                                                    )}
                                                    <span className="text-sm text-muted-foreground">
                                                        {lang.name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Format Selection */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-foreground">Format</h3>
                        <div className="grid gap-2">
                            {EXPORT_FORMATS.map((format) => {
                                const Icon = format.icon;
                                const isSelected = selectedFormat === format.id;

                                return (
                                    <button
                                        key={format.id}
                                        onClick={() => setSelectedFormat(format.id)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg",
                                            "border transition-all text-left",
                                            isSelected
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/30 hover:bg-muted/50"
                                        )}
                                    >
                                        <Icon className={cn(
                                            "h-5 w-5 shrink-0",
                                            isSelected ? "text-primary" : "text-muted-foreground"
                                        )} />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-foreground">
                                                {format.label}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {format.description}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <Check className="h-4 w-4 text-primary shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 p-6 border-t border-border shrink-0">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isExporting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleExportClick}
                        disabled={!canExport}
                    >
                        {isExporting ? "Exporting..." : "Export"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
