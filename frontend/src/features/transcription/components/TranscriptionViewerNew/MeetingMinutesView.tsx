"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "iconoir-react";
import type { TranscriptionAnalysisDto } from "@/types/api/analysis";

interface MeetingMinutesViewProps {
    minutesAnalysis: TranscriptionAnalysisDto | undefined;
    displayLanguage: string | null;
    onBack: () => void;
    className?: string;
}

export function MeetingMinutesView({
    minutesAnalysis,
    displayLanguage,
    onBack,
    className,
}: MeetingMinutesViewProps) {
    // Get content in the appropriate language
    const content = React.useMemo((): string => {
        if (!minutesAnalysis) return "";

        if (displayLanguage && minutesAnalysis.translations[displayLanguage]) {
            return minutesAnalysis.translations[displayLanguage];
        }
        return minutesAnalysis.content;
    }, [minutesAnalysis, displayLanguage]);

    if (!minutesAnalysis) {
        return (
            <div className={cn("flex flex-col items-center justify-center py-12", className)}>
                <p className="text-muted-foreground">No meeting minutes generated yet.</p>
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
                    <h2 className="text-lg font-semibold text-foreground">📝 Meeting Minutes</h2>
                </div>
            </div>

            {/* Content - render markdown as formatted text */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-3xl mx-auto space-y-4">
                    {content.split('\n').map((line, idx) => {
                        // Handle markdown headings
                        if (line.startsWith('# ')) {
                            return <h1 key={idx} className="text-xl font-bold text-foreground mb-4">{line.slice(2)}</h1>;
                        }
                        if (line.startsWith('## ')) {
                            return <h2 key={idx} className="text-lg font-semibold text-foreground mt-6 mb-3 flex items-center gap-2">
                                <span>📌</span> {line.slice(3)}
                            </h2>;
                        }
                        if (line.startsWith('### ')) {
                            return <h3 key={idx} className="text-base font-medium text-foreground mt-4 mb-2">{line.slice(4)}</h3>;
                        }

                        // Handle bullet points
                        if (line.match(/^- /)) {
                            const text = line.slice(2).replace(/\*\*/g, '');
                            return (
                                <div key={idx} className="flex items-start gap-2 py-1">
                                    <span className="text-primary mt-1">•</span>
                                    <span className="text-sm text-muted-foreground">{text}</span>
                                </div>
                            );
                        }

                        // Handle numbered items
                        if (line.match(/^\d+\. /)) {
                            const text = line.replace(/^\d+\. /, '').replace(/\*\*/g, '');
                            return (
                                <div key={idx} className="flex items-start gap-2 py-1 ml-2">
                                    <span className="text-sm text-muted-foreground">{text}</span>
                                </div>
                            );
                        }

                        // Regular text
                        if (line.trim()) {
                            return <p key={idx} className="text-sm text-muted-foreground">{line}</p>;
                        }

                        return null;
                    })}
                </div>
            </div>
        </div>
    );
}
