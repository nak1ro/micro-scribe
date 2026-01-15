"use client";

import { cn } from "@/lib/utils";
import { RefreshDouble, ArrowLeft, Plus } from "iconoir-react";
import { ANALYSIS_TYPES_CONFIG } from "../../constants";
import { AnalysisMenuItem } from "../items/AnalysisMenuItem";
import type { TranscriptionAnalysisDto, AnalysisType } from "@/features/transcription/types/analysis";

interface AnalysisMenuDropdownProps {
    currentView: string;
    generatedCount: number;
    isGenerating: boolean;
    disabled?: boolean;
    onSelectView: (view: "transcript" | AnalysisType) => void;
    onGenerateAll: () => void;
    isLoading: (type: AnalysisType) => boolean;
    isCompleted: (type: AnalysisType) => boolean;
    isFailed: (type: AnalysisType) => boolean;
    handleClick: (item: (typeof ANALYSIS_TYPES_CONFIG)[number]) => void;
    onClose: () => void;
}

const dropdownClasses = "absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg py-1";

export function AnalysisMenuDropdown({
    currentView,
    generatedCount,
    isGenerating,
    disabled,
    onSelectView,
    onGenerateAll,
    isLoading,
    isCompleted,
    isFailed,
    handleClick,
    onClose,
}: AnalysisMenuDropdownProps) {
    return (
        <div className={dropdownClasses}>
            {/* View Transcript - shown when in analysis view */}
            {currentView !== "transcript" && (
                <>
                    <button
                        onClick={() => { onSelectView("transcript"); onClose(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>View Transcript</span>
                    </button>
                    <div className="h-px bg-border my-1" />
                </>
            )}

            {/* Analysis items */}
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
                        onClick={onGenerateAll}
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
    );
}
