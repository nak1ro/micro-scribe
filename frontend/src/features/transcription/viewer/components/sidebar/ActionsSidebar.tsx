"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, Clock, Group, EditPencil, Undo } from "iconoir-react";
import { Button } from "@/components/ui";
import { ExportMenu } from "./ExportMenu";
import { LanguageMenu } from "./LanguageMenu";
import { Toggle } from "@/components/ui";
import { AnalysisMenu } from "../../../analysis/components/menu/AnalysisMenu";
import type { ExportFormat } from "@/features/transcription/types";
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
        <div className={cn("flex flex-col h-full p-6 gap-8", className)}>

            {/* Primary Actions Section */}
            <div className="space-y-6">
                <div className="px-1 flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Actions
                    </h3>
                </div>

                {/* AI Analysis - Hero Card */}
                <AnalysisMenu
                    analyses={analyses}
                    isGenerating={isAnalysisGenerating}
                    generatingTypes={generatingAnalysisTypes}
                    onGenerate={onGenerateAnalysis}
                    onGenerateAll={onGenerateAllAnalysis}
                    onSelectView={onSelectAnalysisView}
                    currentView={currentAnalysisView}
                    disabled={disabled}
                    className="shadow-sm"
                />

                <div className="grid grid-cols-2 gap-4">
                    {/* Language */}
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

                    {/* Export */}
                    <ExportMenu
                        onExport={onExport}
                        displayLanguage={displayLanguage}
                        sourceLanguage={sourceLanguage}
                        disabled={disabled}
                    />
                </div>

                {/* Copy Action - Card Style */}
                <button
                    onClick={onCopy}
                    disabled={disabled || !canCopy}
                    className={cn(
                        "w-full flex items-center gap-3",
                        "p-4 rounded-xl text-left shadow-sm",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        isCopied
                            ? "bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted/50 hover:bg-muted border border-border hover:border-primary/30 text-foreground"
                    )}
                >
                    <div className={cn(
                        "p-1.5 rounded-md transition-colors",
                        isCopied
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                    )}>
                        {isCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </div>
                    <span className="text-sm font-semibold">
                        {isCopied ? "Copied!" : "Copy Transcript"}
                    </span>
                </button>
            </div>

            {/* View Options Section - Individual Mini-Cards */}
            <div className="space-y-4">
                <h3 className="px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    View Options
                </h3>

                <div className="space-y-3">
                    {/* Timecodes Toggle Card */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-muted text-muted-foreground">
                                <Clock className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium text-foreground">Timecodes</span>
                        </div>
                        <Toggle
                            checked={showTimecodes}
                            onChange={onToggleTimecodes}
                            disabled={disabled}
                        />
                    </div>

                    {/* Speakers Toggle Card */}
                    {hasSpeakers && (
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-md bg-muted text-muted-foreground">
                                    <Group className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-foreground">Speakers</span>
                            </div>
                            <Toggle
                                checked={showSpeakers}
                                onChange={onToggleSpeakers}
                                disabled={disabled}
                            />
                        </div>
                    )}

                    {/* Edit Mode Toggle Card */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-muted text-muted-foreground">
                                <EditPencil className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium text-foreground">Edit Mode</span>
                        </div>
                        <Toggle
                            checked={isEditMode}
                            onChange={onToggleEditMode}
                            disabled={disabled}
                        />
                    </div>
                </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Edit Actions Footer */}
            {hasEditedSegments && (
                <div className="pt-4 border-t border-border/50 animate-fade-in">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRevertAll}
                        disabled={disabled || isReverting}
                        className="w-full justify-center gap-2 text-warning hover:text-warning hover:bg-warning/10"
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
