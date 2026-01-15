"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, Clock, Group, EditPencil, Settings, Undo } from "iconoir-react";
import { Button } from "@/components/ui";
import { ExportMenu } from "@/features/transcription";
import { LanguageMenu } from "./LanguageMenu";
import { Toggle } from "@/components/ui";
import { AnalysisMenu } from "@/features/transcription";
import type { ExportFormat } from "@/features/transcription";
import { SettingsRow } from "./SettingsRow";
import type { TranscriptionAnalysisDto, AnalysisType } from "@/features/transcription/types";

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
    // Edit mode
    isEditMode: boolean;
    onToggleEditMode: (enabled: boolean) => void;
    hasEditedSegments: boolean;
    onRevertAll: () => void;
    isReverting: boolean;
    // Status
    disabled?: boolean;
    className?: string;
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
    isEditMode,
    onToggleEditMode,
    hasEditedSegments,
    onRevertAll,
    isReverting,
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
                <Button
                    onClick={onCopy}
                    disabled={disabled || !canCopy}
                    variant="outline"
                    className={cn(
                        "w-full justify-start gap-2",
                        "border-border hover:border-primary/30",
                        isCopied && "text-success border-success/30 bg-success/5 hover:bg-success/10 hover:border-success/30 hover:text-success",
                        !isCopied && "text-foreground hover:text-foreground"
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
                </Button>
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
                <SettingsRow
                    icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                    label="Timecodes"
                >
                    <Toggle
                        checked={showTimecodes}
                        onChange={onToggleTimecodes}
                        disabled={disabled}
                    />
                </SettingsRow>

                {/* Speakers toggle */}
                {hasSpeakers && (
                    <SettingsRow
                        icon={<Group className="h-4 w-4 text-muted-foreground" />}
                        label="Speakers"
                    >
                        <Toggle
                            checked={showSpeakers}
                            onChange={onToggleSpeakers}
                            disabled={disabled}
                        />
                    </SettingsRow>
                )}

                {/* Edit Mode Toggle */}
                <SettingsRow
                    icon={<EditPencil className="h-4 w-4 text-muted-foreground" />}
                    label="Edit Mode"
                >
                    <Toggle
                        checked={isEditMode}
                        onChange={onToggleEditMode}
                        disabled={disabled}
                    />
                </SettingsRow>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Edit actions - shown when there are edited segments */}
            {hasEditedSegments && (
                <div className="pt-6 border-t border-border">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRevertAll}
                        disabled={disabled || isReverting}
                        className="w-full justify-start gap-2 text-warning hover:text-warning hover:border-warning/30"
                    >
                        {isReverting ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <Undo className="h-4 w-4" />
                        )}
                        <span>Revert All Edits</span>
                    </Button>
                </div>
            )}
        </div>
    );
}
