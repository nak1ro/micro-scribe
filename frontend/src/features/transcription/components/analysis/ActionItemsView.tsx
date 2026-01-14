"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Circle, CheckCircle, WarningTriangle, User } from "iconoir-react";
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

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case "High":
                return {
                    bg: "bg-red-500/10",
                    text: "text-red-600 dark:text-red-400",
                    border: "border-red-500/20",
                    icon: "🔴",
                    label: "High Priority"
                };
            case "Medium":
                return {
                    bg: "bg-amber-500/10",
                    text: "text-amber-600 dark:text-amber-400",
                    border: "border-amber-500/20",
                    icon: "🟡",
                    label: "Medium"
                };
            case "Low":
                return {
                    bg: "bg-emerald-500/10",
                    text: "text-emerald-600 dark:text-emerald-400",
                    border: "border-emerald-500/20",
                    icon: "🟢",
                    label: "Low"
                };
            default:
                return {
                    bg: "bg-muted",
                    text: "text-muted-foreground",
                    border: "border-border",
                    icon: "⚪",
                    label: priority
                };
        }
    };

    if (!actionItemsAnalysis) {
        return (
            <div className={cn("flex flex-col items-center justify-center py-16", className)}>
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <span className="text-2xl opacity-50">✅</span>
                </div>
                <p className="text-muted-foreground">No action items generated yet.</p>
            </div>
        );
    }

    // Handle async states
    if (actionItemsAnalysis.status === "Pending" || actionItemsAnalysis.status === "Processing") {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg">📋</span>
                        </div>
                    </div>
                    <p className="text-muted-foreground animate-pulse font-medium">
                        {actionItemsAnalysis.status === "Pending" ? "Queued for analysis..." : "Finding action items..."}
                    </p>
                </div>
            </div>
        );
    }

    if (actionItemsAnalysis.status === "Failed") {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="p-4 bg-destructive/10 rounded-2xl mb-4">
                        <WarningTriangle className="w-8 h-8 text-destructive" />
                    </div>
                    <p className="font-semibold text-foreground mb-1">Analysis Failed</p>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        {actionItemsAnalysis.errorMessage || "An unexpected error occurred."}
                    </p>
                </div>
            </div>
        );
    }

    const completedCount = completed.size;
    const totalCount = actionItems.length;

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Progress header */}
            {totalCount > 0 && (
                <div className="px-4 py-3 border-b border-border/50">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            {completedCount} of {totalCount} completed
                        </span>
                        <div className="w-32 h-2 rounded-full bg-muted/50 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                                style={{ width: `${(completedCount / totalCount) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Action items list */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="max-w-3xl mx-auto space-y-3">
                    {actionItems.map((item, idx) => {
                        const isComplete = completed.has(idx);
                        const priorityConfig = getPriorityConfig(item.priority || "");

                        return (
                            <div
                                key={idx}
                                className={cn(
                                    "group relative p-4 rounded-xl border",
                                    "bg-card/30 backdrop-blur-sm",
                                    "transition-all duration-300 ease-out",
                                    isComplete
                                        ? "border-success/30 bg-success/5 opacity-70"
                                        : "border-border/50 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => toggleComplete(idx)}
                                        className={cn(
                                            "mt-0.5 shrink-0 transition-transform duration-200",
                                            "hover:scale-110 active:scale-95"
                                        )}
                                        aria-label={isComplete ? "Mark incomplete" : "Mark complete"}
                                    >
                                        {isComplete ? (
                                            <CheckCircle className="h-6 w-6 text-success" />
                                        ) : (
                                            <Circle className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                        )}
                                    </button>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <p className={cn(
                                            "text-sm text-foreground leading-relaxed transition-all duration-200",
                                            isComplete && "line-through text-muted-foreground"
                                        )}>
                                            {item.task}
                                        </p>

                                        {/* Meta badges */}
                                        <div className="flex flex-wrap gap-2">
                                            {item.owner && (
                                                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                                                    <User className="w-3 h-3" />
                                                    {item.owner}
                                                </span>
                                            )}
                                            {item.priority && (
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border",
                                                    priorityConfig.bg,
                                                    priorityConfig.text,
                                                    priorityConfig.border
                                                )}>
                                                    <span className="text-[10px]">{priorityConfig.icon}</span>
                                                    {priorityConfig.label}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Priority accent bar */}
                                {item.priority && !isComplete && (
                                    <div className={cn(
                                        "absolute left-0 top-3 bottom-3 w-1 rounded-full",
                                        item.priority === "High" && "bg-red-500",
                                        item.priority === "Medium" && "bg-amber-500",
                                        item.priority === "Low" && "bg-emerald-500"
                                    )} />
                                )}
                            </div>
                        );
                    })}

                    {actionItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                <span className="text-2xl">🎉</span>
                            </div>
                            <p className="text-muted-foreground">
                                No action items found in this transcription.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
