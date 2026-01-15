"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TranscriptionAnalysisDto, ActionItemsContent, ActionItemContent } from "@/features/transcription/types/analysis";
import { parseAnalysisContent } from "@/features/transcription/types/analysis";
import { AnalysisLoading, AnalysisError, AnalysisEmpty } from "./shared/AnalysisStates";
import { ActionItemRow } from "./items/ActionItemRow";
import { useActionItems } from "@/features/transcription/hooks/useActionItems";

interface ActionItemsViewProps {
    actionItemsAnalysis: TranscriptionAnalysisDto | undefined;
    displayLanguage: string | null;
    className?: string;
}

// ─────────────────────────────────────────────────────────────
// Refactored Component
// ─────────────────────────────────────────────────────────────

export function ActionItemsView({
    actionItemsAnalysis,
    displayLanguage,
    className,
}: ActionItemsViewProps) {
    const {
        completed,
        actionItems,
        toggleComplete,
        completedCount,
        totalCount,
        progressPercentage
    } = useActionItems({ actionItemsAnalysis, displayLanguage });

    if (!actionItemsAnalysis) {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                <AnalysisEmpty icon="✅">
                    No action items generated yet.
                </AnalysisEmpty>
            </div>
        );
    }

    if (actionItemsAnalysis.status === "Pending" || actionItemsAnalysis.status === "Processing") {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                <div className="flex-1 flex flex-col items-center justify-center">
                    <AnalysisLoading>
                        {actionItemsAnalysis.status === "Pending" ? "Queued for analysis..." : "Finding action items..."}
                    </AnalysisLoading>
                </div>
            </div>
        );
    }

    if (actionItemsAnalysis.status === "Failed") {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                <div className="flex-1 flex flex-col items-center justify-center">
                    <AnalysisError message={actionItemsAnalysis.errorMessage || undefined} />
                </div>
            </div>
        );
    }

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
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Action items list */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="max-w-3xl mx-auto space-y-3">
                    {actionItems.map((item, idx) => (
                        <ActionItemRow
                            key={idx}
                            item={item}
                            isComplete={completed.has(idx)}
                            onToggle={() => toggleComplete(idx)}
                        />
                    ))}

                    {actionItems.length === 0 && (
                        <AnalysisEmpty icon="🎉">
                            No action items found in this transcription.
                        </AnalysisEmpty>
                    )}
                </div>
            </div>
        </div>
    );
}

