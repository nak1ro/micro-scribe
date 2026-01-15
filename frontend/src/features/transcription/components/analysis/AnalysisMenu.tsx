"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { NavArrowDown, RefreshDouble, ReportColumns, ArrowLeft, Plus } from "iconoir-react";
import { useAnalysisMenu } from "@/features/transcription/hooks/useAnalysisMenu";
import type { TranscriptionAnalysisDto, AnalysisType } from "@/features/transcription/types/analysis";
import { ANALYSIS_TYPES_CONFIG, AnalysisTypeConfig } from "./constants";
import { AnalysisMenuItem } from "./items/AnalysisMenuItem";

interface AnalysisMenuProps {
    analyses: TranscriptionAnalysisDto[];
    isGenerating: boolean;
    generatingTypes: AnalysisType[];
    onGenerate: (types: AnalysisType[]) => void;
    onGenerateAll: () => void;
    onSelectView: (view: "transcript" | AnalysisType) => void;
    currentView: string;
    disabled?: boolean;
    className?: string;
}

// ─────────────────────────────────────────────────────────────
// Refactored Component
// ─────────────────────────────────────────────────────────────

export function AnalysisMenu({
    analyses,
    isGenerating,
    generatingTypes,
    onGenerate,
    onGenerateAll,
    onSelectView,
    currentView,
    disabled,
    className,
}: AnalysisMenuProps) {
    const {
        isOpen,
        setIsOpen,
        menuRef,
        isLoading,
        isCompleted,
        isFailed,
        generatedCount,
        handleClick,
        toggleOpen
    } = useAnalysisMenu({
        analyses,
        generatingTypes,
        onGenerate,
        onSelectView: (view) => onSelectView(view as any), // Type cast if needed depending on prop types, though AnalysisType should match
    });

    return (
        <div ref={menuRef} className={cn("relative", className)}>
            {/* Trigger */}
            <button
                onClick={toggleOpen}
                disabled={disabled}
                className={cn(
                    "w-full flex items-center justify-between gap-2",
                    "px-3 py-2.5 rounded-lg",
                    "bg-muted/50 hover:bg-muted",
                    "border border-border hover:border-primary/30",
                    "text-sm font-medium text-foreground",
                    "transition-colors duration-150",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
            >
                <div className="flex items-center gap-2">
                    {isGenerating ? (
                        <RefreshDouble className="h-4 w-4 text-primary animate-spin" />
                    ) : (
                        <ReportColumns className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>AI Analysis</span>
                </div>
                <div className="flex items-center gap-1.5">
                    {generatedCount > 0 && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-success/10 text-success">
                            {generatedCount}/{ANALYSIS_TYPES_CONFIG.length}
                        </span>
                    )}
                    <NavArrowDown className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        isOpen && "rotate-180"
                    )} />
                </div>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg py-1">
                    {/* View Transcript - shown when in analysis view */}
                    {currentView !== "transcript" && (
                        <>
                            <button
                                onClick={() => { onSelectView("transcript"); setIsOpen(false); }}
                                className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2",
                                    "text-left text-sm font-medium text-primary hover:bg-primary/5",
                                    "transition-colors"
                                )}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>View Transcript</span>
                            </button>
                            <div className="h-px bg-border my-1" />
                        </>
                    )}
                    {ANALYSIS_TYPES_CONFIG.map((item) => (
                        <AnalysisMenuItem
                            key={item.type}
                            item={item}
                            isLoading={isLoading(item.type)}
                            isCompleted={isCompleted(item.type)}
                            isFailed={isFailed(item.type)}
                            isActive={currentView === item.type}
                            disabled={disabled}
                            onClick={() => handleClick(item)}
                        />
                    ))}

                    {/* Generate All */}
                    {generatedCount < ANALYSIS_TYPES_CONFIG.length && (
                        <>
                            <div className="h-px bg-border my-1" />
                            <button
                                onClick={() => { onGenerateAll(); }}
                                disabled={isGenerating || disabled}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2 px-3 py-2",
                                    "text-sm font-medium text-primary hover:bg-primary/5",
                                    (isGenerating || disabled) && "opacity-50"
                                )}
                            >
                                {isGenerating ? <RefreshDouble className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                <span>Generate All</span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

