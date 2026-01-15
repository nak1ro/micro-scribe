"use client";

import { cn } from "@/lib/utils";
import { NavArrowDown, RefreshDouble, ReportColumns } from "iconoir-react";
import { useAnalysisMenu } from "../../hooks/useAnalysisMenu";
import { ANALYSIS_TYPES_CONFIG } from "../../constants";
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
        <div ref={menuRef} className="relative group">
            {/* Trigger */}
            <button
                onClick={toggleOpen}
                disabled={disabled}
                className={cn(
                    "w-full flex items-center justify-between gap-4", // Increased gap
                    "p-5 rounded-2xl", // Increased padding & radius
                    "bg-primary/10 dark:bg-primary/15 hover:bg-primary/15 dark:hover:bg-primary/20", // Stronger tint
                    "border border-primary/10 hover:border-primary/20",
                    "transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    isOpen && "ring-2 ring-primary/20 border-primary/30",
                    className // Apply external classes (shadow) here
                )}
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-xl", // Bigger container
                        "bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors",
                        isGenerating && "animate-pulse"
                    )}>
                        {isGenerating ? (
                            <RefreshDouble className="h-6 w-6 animate-spin" /> // Bigger icon
                        ) : (
                            <ReportColumns className="h-6 w-6" /> // Bigger icon
                        )}
                    </div>
                    <div className="flex flex-col items-start gap-1">
                        <span className="text-base font-semibold text-foreground">AI Analysis</span> {/* Bigger text */}
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground"> {/* Bigger text */}
                            <span>{generatedCount}/{ANALYSIS_TYPES_CONFIG.length} Ready</span>
                        </div>
                    </div>
                </div>

                <NavArrowDown className={cn("h-5 w-5 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
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
