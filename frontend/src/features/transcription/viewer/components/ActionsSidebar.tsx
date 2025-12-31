"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, Clock, Group, EditPencil, Settings } from "iconoir-react";
import { Button } from "@/components/ui";
import { ExportMenu } from "@/features/transcription/export/components/ExportMenu";
import { LanguageMenu } from "./LanguageMenu";
import { AnalysisMenu } from "@/features/transcription/analysis/components/AnalysisMenu";
import type { ExportFormat } from "@/features/transcription/types";
import type { TranscriptionAnalysisDto, AnalysisType } from "@/types/api/analysis";

interface ActionsSidebarProps {
    // Copy action
    onCopy: () => void;
    isCopied: boolean;
    canCopy: boolean;
    // Toggles
    showTimecodes: boolean;
    onToggleTimecodes: (show: boolean) => void;
    showSpeakers: boolean;
    onToggleSpeakers: (show: boolean) => void;
    hasSpeakers: boolean;
    // Export
    onExport: (format: ExportFormat) => void;
    // Translation
    onTranslate: (targetLanguage: string) => void;
    translatedLanguages: string[];
    translationStatus: string | null;
    translatingToLanguage: string | null;
    canTranslate?: boolean;
    // Language display
    sourceLanguage: string;
    displayLanguage: string | null;
    onDisplayLanguageChange: (lang: string | null) => void;
    // Analysis
    analyses: TranscriptionAnalysisDto[];
    isAnalysisGenerating: boolean;
    generatingAnalysisTypes: AnalysisType[];
    onGenerateAnalysis: (types: AnalysisType[]) => void;
    onGenerateAllAnalysis: () => void;
    onSelectAnalysisView: (view: "transcript" | AnalysisType) => void;
    currentAnalysisView: string;
    // Edit
    onEdit?: () => void;
    // Status
    disabled?: boolean;
    className?: string;
}

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

function Toggle({ checked, onChange, disabled }: ToggleProps) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            disabled={disabled}
            className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer",
                "rounded-full border-2 border-transparent",
                "transition-colors duration-200 ease-in-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                checked ? "bg-primary" : "bg-muted",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            <span
                className={cn(
                    "pointer-events-none inline-block h-4 w-4",
                    "rounded-full bg-background shadow-sm",
                    "transform transition-transform duration-200 ease-in-out",
                    checked ? "translate-x-4" : "translate-x-0"
                )}
            />
        </button>
    );
}

export function ActionsSidebar({
    onCopy,
    isCopied,
    canCopy,
    showTimecodes,
    onToggleTimecodes,
    showSpeakers,
    onToggleSpeakers,
    hasSpeakers,
    onExport,
    onTranslate,
    translatedLanguages,
    translationStatus,
    translatingToLanguage,
    canTranslate,
    sourceLanguage,
    displayLanguage,
    onDisplayLanguageChange,
    analyses,
    isAnalysisGenerating,
    generatingAnalysisTypes,
    onGenerateAnalysis,
    onGenerateAllAnalysis,
    onSelectAnalysisView,
    currentAnalysisView,
    onEdit,
    disabled,
    className,
}: ActionsSidebarProps) {
    return (
        <div className={cn("flex flex-col h-full p-6", className)}>
            {/* Actions section */}
            <div className="space-y-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    Actions
                </h3>

                {/* Export */}
                <ExportMenu
                    onExport={onExport}
                    displayLanguage={displayLanguage}
                    sourceLanguage={sourceLanguage}
                    disabled={disabled}
                />

                {/* Language (translate + view) */}
                <LanguageMenu
                    sourceLanguage={sourceLanguage}
                    translatedLanguages={translatedLanguages}
                    translationStatus={translationStatus}
                    translatingToLanguage={translatingToLanguage}
                    displayLanguage={displayLanguage}
                    onDisplayLanguageChange={onDisplayLanguageChange}
                    onTranslate={onTranslate}
                    canTranslate={canTranslate}
                    disabled={disabled}
                />

                {/* AI Analysis */}
                <AnalysisMenu
                    analyses={analyses}
                    isGenerating={isAnalysisGenerating}
                    generatingTypes={generatingAnalysisTypes}
                    onGenerate={onGenerateAnalysis}
                    onGenerateAll={onGenerateAllAnalysis}
                    onSelectView={onSelectAnalysisView}
                    currentView={currentAnalysisView}
                    disabled={disabled}
                />
                {/* Copy */}
                {/* Copy */}
                <button
                    onClick={onCopy}
                    disabled={disabled || !canCopy}
                    className={cn(
                        "w-full flex items-center gap-2",
                        "px-3 py-2.5 rounded-lg",
                        "bg-muted/50 hover:bg-muted",
                        "border border-border hover:border-primary/30",
                        "text-sm font-medium text-foreground",
                        "transition-colors duration-150",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        isCopied && "text-success border-success/30 bg-success/5 hover:bg-success/10 hover:border-success/30",
                        !isCopied && "hover:text-foreground"
                    )}
                >
                    {isCopied ? (
                        <>
                            <Check className="h-4 w-4" />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4 text-muted-foreground" />
                            <span>Copy transcript</span>
                        </>
                    )}
                </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-border my-8" />

            {/* Settings section */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 px-1">
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Display
                    </h3>
                </div>

                {/* Timecodes toggle */}
                <div className="flex items-center justify-between gap-3 px-1">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">Timecodes</span>
                    </div>
                    <Toggle
                        checked={showTimecodes}
                        onChange={onToggleTimecodes}
                        disabled={disabled}
                    />
                </div>

                {/* Speakers toggle */}
                {hasSpeakers && (
                    <div className="flex items-center justify-between gap-3 px-1">
                        <div className="flex items-center gap-2">
                            <Group className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">Speakers</span>
                        </div>
                        <Toggle
                            checked={showSpeakers}
                            onChange={onToggleSpeakers}
                            disabled={disabled}
                        />
                    </div>
                )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Edit section */}
            <div className="pt-6 border-t border-border">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    disabled={disabled || !onEdit}
                    className="w-full justify-start gap-2"
                >
                    <EditPencil className="h-4 w-4" />
                    <span>Edit transcript</span>
                </Button>
            </div>
        </div>
    );
}
