"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "iconoir-react";
import type { TranscriptionAnalysisDto } from "@/types/api/analysis";

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
    // Get content in the appropriate language
    const content = React.useMemo((): string => {
        if (!actionItemsAnalysis) return "";

        if (displayLanguage && actionItemsAnalysis.translations[displayLanguage]) {
            return actionItemsAnalysis.translations[displayLanguage];
        }
        return actionItemsAnalysis.content;
    }, [actionItemsAnalysis, displayLanguage]);

    if (!actionItemsAnalysis) {
        return (
            <div className={cn("flex flex-col items-center justify-center py-12", className)}>
                <p className="text-muted-foreground">No action items generated yet.</p>
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
                </div>
            </div>

            {/* Content - render markdown as formatted text */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-3xl mx-auto prose prose-sm dark:prose-invert">
                    {content.split('\n').map((line, idx) => {
                        // Handle markdown headings
                        if (line.startsWith('# ')) {
                            return <h1 key={idx} className="text-xl font-bold text-foreground mb-4">{line.slice(2)}</h1>;
                        }
                        if (line.startsWith('## ')) {
                            return <h2 key={idx} className="text-lg font-semibold text-foreground mb-3">{line.slice(3)}</h2>;
                        }

                        // Handle checkbox items
                        if (line.match(/^- \[[ x]\] /)) {
                            const isChecked = line.includes('[x]');
                            const text = line.replace(/^- \[[ x]\] /, '');
                            return (
                                <div key={idx} className="flex items-start gap-2 py-1">
                                    <span className={cn(
                                        "mt-0.5",
                                        isChecked ? "text-success" : "text-muted-foreground"
                                    )}>
                                        {isChecked ? "☑" : "☐"}
                                    </span>
                                    <span className={cn(
                                        "text-sm text-foreground",
                                        isChecked && "line-through opacity-70"
                                    )}>
                                        {text.replace(/\*\*/g, '')}
                                    </span>
                                </div>
                            );
                        }

                        // Handle indented details
                        if (line.match(/^\s+- \*\*/)) {
                            const text = line.trim().replace(/^- /, '').replace(/\*\*/g, '');
                            const [label, value] = text.split(': ');
                            return (
                                <div key={idx} className="ml-6 text-xs text-muted-foreground py-0.5">
                                    <span className="font-medium">{label}:</span> {value}
                                </div>
                            );
                        }

                        // Regular text
                        if (line.trim()) {
                            return <p key={idx} className="text-sm text-muted-foreground mb-2">{line}</p>;
                        }

                        return null;
                    })}
                </div>
            </div>
        </div>
    );
}
