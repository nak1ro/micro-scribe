"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { NavArrowDown, Check, RefreshDouble, Plus, ReportColumns } from "iconoir-react";
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
    { type: "ShortSummary", label: "TL;DR Summary", hasView: false },
    { type: "Topics", label: "Topics/Tags", hasView: false },
    { type: "Sentiment", label: "Sentiment Analysis", hasView: false },
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
    const isGenerated = (type: AnalysisType) => analyses.some(a => a.analysisType === type);
    const isTypeGenerating = (type: AnalysisType) => generatingTypes.includes(type);
    const generatedCount = ANALYSIS_TYPES.filter(t => isGenerated(t.type)).length;

    // Handle item click
    const handleClick = (item: typeof ANALYSIS_TYPES[0]) => {
        console.log("[AnalysisMenu] handleClick called", item.type, { isGenerated: isGenerated(item.type), isGenerating: isTypeGenerating(item.type) });

        // If generating, do nothing
        if (isTypeGenerating(item.type)) {
            console.log("[AnalysisMenu] Returning early - type is generating");
            return;
        }

        // If has a view (ActionItems, MeetingMinutes)
        if (item.hasView) {
            // Generate if needed, then switch view
            if (!isGenerated(item.type)) {
                console.log("[AnalysisMenu] Calling onGenerate for", item.type);
                onGenerate([item.type]);
            }
            // Switch to that view
            console.log("[AnalysisMenu] Calling onSelectView with", item.type);
            onSelectView(item.type);
            setIsOpen(false);
        } else {
            // For other types, just generate if not already done
            if (!isGenerated(item.type)) {
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
                    {ANALYSIS_TYPES.map((item) => {
                        const generated = isGenerated(item.type);
                        const generating = isTypeGenerating(item.type);
                        const isActive = currentView === item.type;

                        return (
                            <button
                                key={item.type}
                                onClick={() => handleClick(item)}
                                disabled={generating || disabled}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2",
                                    "text-left transition-colors",
                                    isActive ? "bg-primary/10" : "hover:bg-muted",
                                    (generating || disabled) && "opacity-50"
                                )}
                            >
                                <span className="text-sm text-foreground">{item.label}</span>
                                <div className="flex items-center gap-1">
                                    {generating && <RefreshDouble className="h-4 w-4 text-info animate-spin" />}
                                    {generated && !generating && <Check className="h-4 w-4 text-success" />}
                                    {!generated && !generating && <Plus className="h-4 w-4 text-muted-foreground" />}
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

                    {/* Back to Transcript (if viewing analysis) */}
                    {currentView !== "transcript" && (
                        <>
                            <div className="h-px bg-border my-1" />
                            <button
                                onClick={() => { onSelectView("transcript"); setIsOpen(false); }}
                                className="w-full px-3 py-2 text-sm text-muted-foreground hover:bg-muted text-left"
                            >
                                ← Back to Transcript
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
