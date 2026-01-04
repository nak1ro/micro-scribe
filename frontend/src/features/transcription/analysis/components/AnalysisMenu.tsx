"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { NavArrowDown, Check, RefreshDouble, Plus, ReportColumns, ArrowLeft } from "iconoir-react";
import type { TranscriptionAnalysisDto, AnalysisType } from "@/types/api/analysis";

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

// Analysis types we support
const ANALYSIS_TYPES: { type: AnalysisType; label: string; hasView: boolean }[] = [
    { type: "ShortSummary", label: "TL;DR Summary", hasView: true },
    { type: "Topics", label: "Topics/Tags", hasView: true },
    { type: "Sentiment", label: "Sentiment Analysis", hasView: true },
    { type: "ActionItems", label: "Action Items", hasView: true },
    { type: "MeetingMinutes", label: "Meeting Minutes", hasView: true },
];

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
    const [isOpen, setIsOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Check helpers
    // Check helpers
    const getAnalysis = (type: AnalysisType) => analyses.find(a => a.analysisType === type);

    // An item is "loading" if the API request is in flight OR if the background job is pending/processing
    const isLoading = (type: AnalysisType) => {
        const analysis = getAnalysis(type);
        return generatingTypes.includes(type) ||
            analysis?.status === "Pending" ||
            analysis?.status === "Processing";
    };

    // An item is "complete" only if it exists and is marked Completed
    const isCompleted = (type: AnalysisType) => getAnalysis(type)?.status === "Completed";

    // An item is "failed"
    const isFailed = (type: AnalysisType) => getAnalysis(type)?.status === "Failed";

    const generatedCount = ANALYSIS_TYPES.filter(t => isCompleted(t.type)).length;

    // Handle item click
    const handleClick = (item: typeof ANALYSIS_TYPES[0]) => {
        const loading = isLoading(item.type);
        const complete = isCompleted(item.type);
        const failed = isFailed(item.type);

        console.log("[AnalysisMenu] handleClick called", item.type, { loading, complete, failed });

        // If loading, do nothing
        if (loading) {
            console.log("[AnalysisMenu] Returning early - type is loading");
            return;
        }

        // If has a view (ActionItems, MeetingMinutes)
        if (item.hasView) {
            // If complete, open the view
            if (complete) {
                console.log("[AnalysisMenu] Opening view for", item.type);
                onSelectView(item.type);
                setIsOpen(false);
                return;
            }

            // If not complete (or failed), generate/retry
            console.log("[AnalysisMenu] Generating/Retrying", item.type);
            onGenerate([item.type]);
        } else {
            // For other types, generate if not complete
            if (!complete) {
                console.log("[AnalysisMenu] Calling onGenerate for non-view type", item.type);
                onGenerate([item.type]);
            }
        }
    };

    return (
        <div ref={menuRef} className={cn("relative", className)}>
            {/* Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
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
                            {generatedCount}/{ANALYSIS_TYPES.length}
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
                    {ANALYSIS_TYPES.map((item) => {
                        const loading = isLoading(item.type);
                        const complete = isCompleted(item.type);
                        const failed = isFailed(item.type);
                        const isActive = currentView === item.type;

                        return (
                            <button
                                key={item.type}
                                onClick={() => handleClick(item)}
                                disabled={loading || disabled}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2",
                                    "text-left transition-colors",
                                    isActive ? "bg-primary/10" : "hover:bg-muted",
                                    (loading || disabled) && "opacity-70 cursor-wait"
                                )}
                            >
                                <span className={cn("text-sm", failed ? "text-destructive" : "text-foreground")}>
                                    {item.label}
                                </span>
                                <div className="flex items-center gap-1">
                                    {loading && <RefreshDouble className="h-4 w-4 text-info animate-spin" />}
                                    {complete && <Check className="h-4 w-4 text-success" />}
                                    {failed && <span className="text-xs text-destructive font-medium">Failed</span>}
                                    {!complete && !loading && !failed && <Plus className="h-4 w-4 text-muted-foreground" />}
                                </div>
                            </button>
                        );
                    })}

                    {/* Generate All */}
                    {generatedCount < ANALYSIS_TYPES.length && (
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
