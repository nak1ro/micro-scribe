"use client";

import * as React from "react";
import Link from "next/link";
import { X, Check, RefreshDouble, Plus, Download, Lock, Code } from "iconoir-react";
import { Page, TextBox, MediaVideo, Table2Columns, MusicDoubleNote } from "iconoir-react";
import { cn, getLanguageName } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useTranscriptionJob } from "@/features/transcription/hooks/useTranscriptions";
import { usePlanLimits, useEscapeKey } from "@/hooks";
import { transcriptionApi } from "@/features/transcription/api";
import { handleExport } from "@/features/transcription/utils/exportUtils";

import { AVAILABLE_LANGUAGES, EXPORT_FORMAT_OPTIONS } from "@/features/transcription/constants";
import type { ExportFormat, TranscriptionData } from "@/features/transcription/types";

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
}

const iconMap = {
    Page,
    TextBox,
    MediaVideo,
    Table2Columns,
    MusicDoubleNote,
    Code
};

export function ExportModal({ isOpen, onClose, jobId }: ExportModalProps) {
    const { data: job, refetch: refetchJob } = useTranscriptionJob(jobId);
    const { limits, canExport } = usePlanLimits();

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

    // Close on escape (disabled while exporting)
    useEscapeKey(onClose, isOpen && !isExporting);

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
            await handleExport(selectedFormat, job.jobId, selectedLanguage, job.presignedUrl);
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Export failed";
            setError(message);
        } finally {
            setIsExporting(false);
        }
    };

    if (!isOpen) return null;

    const canStartExport = selectedFormat !== null && !isExporting && !isTranslating && !isJobTranslating;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Export Notification */}
            {isExporting && (
                <div className="fixed bottom-6 right-6 z-[100] bg-card text-foreground px-5 py-4 rounded-xl shadow-xl flex items-center gap-3 border border-border">
                    <RefreshDouble className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm font-semibold">Preparing download...</span>
                </div>
            )}

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
                                            const isRestricted = !limits.translation;

                                            return (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => !isRestricted && handleTranslate(lang.code)}
                                                    disabled={isTranslating || isJobTranslating || isRestricted}
                                                    className={cn(
                                                        "w-full flex items-center justify-between gap-2 px-4 py-2.5",
                                                        "text-left transition-colors border-t border-border",
                                                        (isTranslating || isJobTranslating || isRestricted)
                                                            ? "opacity-50 cursor-not-allowed"
                                                            : "hover:bg-muted cursor-pointer"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {isCurrentlyTranslating ? (
                                                            <RefreshDouble className="h-3.5 w-3.5 text-info animate-spin" />
                                                        ) : (
                                                            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                                                        )}
                                                        <span className="text-sm text-muted-foreground">
                                                            {lang.name}
                                                        </span>
                                                    </div>
                                                    {isRestricted && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
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
                            {EXPORT_FORMAT_OPTIONS.map((format) => {
                                const Icon = iconMap[format.icon as keyof typeof iconMap] || Page;
                                const isSelected = selectedFormat === format.id;
                                const isRestricted = !canExport(format.id);

                                return (
                                    <button
                                        key={format.id}
                                        onClick={() => !isRestricted && setSelectedFormat(format.id)}
                                        disabled={isRestricted}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg",
                                            "border transition-all text-left",
                                            isSelected
                                                ? "border-primary bg-primary/5"
                                                : "border-border",
                                            !isSelected && !isRestricted && "hover:border-primary/30 hover:bg-muted/50",
                                            isRestricted && "opacity-50 cursor-not-allowed bg-muted border-transparent"
                                        )}
                                    >
                                        <Icon className={cn(
                                            "h-5 w-5 shrink-0",
                                            isSelected ? "text-primary" : "text-muted-foreground"
                                        )} />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                                {format.label}
                                                {isRestricted && <Lock className="h-3.5 w-3.5 ml-auto text-muted-foreground" />}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {isRestricted ? (
                                                    <Link href="/pricing" className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                                                        Upgrade to Pro
                                                    </Link>
                                                ) : (
                                                    format.description
                                                )}
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
                        disabled={!canStartExport}
                    >
                        {isExporting ? "Exporting..." : "Export"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
