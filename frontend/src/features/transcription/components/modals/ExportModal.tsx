"use client";

import * as React from "react";
import { X, Download, RefreshDouble } from "iconoir-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { usePlanLimits, useEscapeKey } from "@/hooks";
import { useExportModal } from "@/features/transcription/hooks/useExportModal";
import { ExportLanguageSelector } from "./export/ExportLanguageSelector";
import { ExportFormatSelector } from "./export/ExportFormatSelector";

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
}

export function ExportModal({ isOpen, onClose, jobId }: ExportModalProps) {
    const { limits, canExport } = usePlanLimits();
    const {
        job,
        selectedFormat,
        setSelectedFormat,
        selectedLanguage,
        setSelectedLanguage,
        isExporting,
        isTranslating,
        isJobTranslating,
        error,
        handleTranslate,
        handleExportClick,
    } = useExportModal({ jobId, isOpen, onClose });

    // Close on escape (disabled while exporting)
    useEscapeKey(onClose, isOpen && !isExporting);

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
                    <ExportLanguageSelector
                        job={job || undefined}
                        selectedLanguage={selectedLanguage}
                        onSelect={setSelectedLanguage}
                        onTranslate={handleTranslate}
                        isTranslating={isTranslating}
                        isJobTranslating={isJobTranslating}
                        canTranslate={limits.translation}
                    />

                    <ExportFormatSelector
                        selectedFormat={selectedFormat}
                        onSelect={setSelectedFormat}
                        canExport={canExport}
                    />

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
