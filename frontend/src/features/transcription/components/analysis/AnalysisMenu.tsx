"use client";

import { cn } from "@/lib/utils";
import { NavArrowDown, RefreshDouble, ReportColumns } from "iconoir-react";
import { useAnalysisMenu } from "@/features/transcription/hooks/useAnalysisMenu";
import { ANALYSIS_TYPES_CONFIG } from "./constants";
import { AnalysisMenuDropdown } from "./AnalysisMenuDropdown";
import type { TranscriptionAnalysisDto, AnalysisType } from "@/features/transcription/types/analysis";

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

const triggerClasses = cn(
    "w-full flex items-center justify-between gap-2",
    "px-3 py-2.5 rounded-lg",
    "bg-muted/50 hover:bg-muted",
    "border border-border hover:border-primary/30",
    "text-sm font-medium text-foreground",
    "transition-colors duration-150",
    "disabled:opacity-50 disabled:cursor-not-allowed"
);

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
        toggleOpen,
    } = useAnalysisMenu({
        analyses,
        generatingTypes,
        onGenerate,
        onSelectView,
    });

    return (
        <div ref={menuRef} className={cn("relative", className)}>
            {/* Trigger */}
            <button onClick={toggleOpen} disabled={disabled} className={triggerClasses}>
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
                    <NavArrowDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <AnalysisMenuDropdown
                    currentView={currentView}
                    generatedCount={generatedCount}
                    isGenerating={isGenerating}
                    disabled={disabled}
                    onSelectView={onSelectView}
                    onGenerateAll={onGenerateAll}
                    isLoading={isLoading}
                    isCompleted={isCompleted}
                    isFailed={isFailed}
                    handleClick={handleClick}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
