"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, Square, CheckSquare } from "iconoir-react";
import type { TranscriptionAnalysisDto, ActionItemsContent, ActionItemContent } from "@/types/api/analysis";
import { parseAnalysisContent } from "@/types/api/analysis";

interface ActionItemsViewProps {
    actionItemsAnalysis: TranscriptionAnalysisDto | undefined;
    displayLanguage: string | null;
    onBack: () => void;
    className?: string;
}

export function ActionItemsView({
    actionItemsAnalysis,
    displayLanguage,
    onBack,
    className,
}: ActionItemsViewProps) {
    // Local state for completion (not persisted)
    const [completed, setCompleted] = React.useState<Set<number>>(new Set());

    // Get action items in the appropriate language
    const actionItems = React.useMemo((): ActionItemContent[] => {
        if (!actionItemsAnalysis) return [];

        let content = actionItemsAnalysis.content;
        if (displayLanguage && actionItemsAnalysis.translations[displayLanguage]) {
            content = actionItemsAnalysis.translations[displayLanguage];
        }

        const parsed = parseAnalysisContent<ActionItemsContent>(content);
        return parsed?.actionItems ?? [];
    }, [actionItemsAnalysis, displayLanguage]);

    const toggleComplete = (index: number) => {
        setCompleted(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "High": return "bg-destructive/10 text-destructive";
            case "Medium": return "bg-warning/10 text-warning";
            case "Low": return "bg-success/10 text-success";
            default: return "bg-muted text-muted-foreground";
        }
    };

    if (!actionItemsAnalysis) {
        return (
            <div className={cn("flex flex-col items-center justify-center py-12", className)}>
                <p className="text-muted-foreground">No action items generated yet.</p>
            </div>
        );
    }

    // Handle async states
    if (actionItemsAnalysis.status === "Pending" || actionItemsAnalysis.status === "Processing") {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <button
                        onClick={onBack}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        aria-label="Back to transcript"
                    >
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">📋 Action Items</h2>
                        <p className="text-xs text-muted-foreground">Generating...</p>
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground animate-pulse">
                        {actionItemsAnalysis.status === "Pending" ? "Queued for analysis..." : "Identifying action items..."}
                    </p>
                </div>
            </div>
        );
    }

    if (actionItemsAnalysis.status === "Failed") {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <button
                        onClick={onBack}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        aria-label="Back to transcript"
                    >
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">📋 Action Items</h2>
                        <p className="text-xs text-destructive">Failed</p>
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="p-3 bg-destructive/10 rounded-full text-destructive">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12.01" y1="8" y2="8" /><line x1="12" y1="12" x2="12" y2="16" /></svg>
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">Analysis Failed</p>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                            {actionItemsAnalysis.errorMessage || "An unexpected error occurred while generating action items."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <button
                    onClick={onBack}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Back to transcript"
                >
                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </button>
                <div>
                    <h2 className="text-lg font-semibold text-foreground">📋 Action Items</h2>
                    <p className="text-xs text-muted-foreground">
                        {actionItems.length} items • {completed.size} completed
                    </p>
                </div>
            </div>

            {/* Action items list */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="max-w-3xl mx-auto space-y-2">
                    {actionItems.map((item, idx) => {
                        const isComplete = completed.has(idx);

                        return (
                            <div
                                key={idx}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border border-border",
                                    "hover:bg-muted/50 transition-colors",
                                    isComplete && "bg-muted/30 opacity-70"
                                )}
                            >
                                <button
                                    onClick={() => toggleComplete(idx)}
                                    className="mt-0.5 shrink-0"
                                    aria-label={isComplete ? "Mark incomplete" : "Mark complete"}
                                >
                                    {isComplete ? (
                                        <CheckSquare className="h-5 w-5 text-success" />
                                    ) : (
                                        <Square className="h-5 w-5 text-muted-foreground hover:text-primary" />
                                    )}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "text-sm text-foreground",
                                        isComplete && "line-through"
                                    )}>
                                        {item.task}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                        {item.owner && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                👤 {item.owner}
                                            </span>
                                        )}
                                        {item.priority && (
                                            <span className={cn("text-xs px-2 py-0.5 rounded-full", getPriorityColor(item.priority))}>
                                                {item.priority}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {actionItems.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            No action items found in this transcription.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
