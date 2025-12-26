"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "iconoir-react";
import type { TranscriptionAnalysisDto, MeetingMinutesContent } from "@/types/api/analysis";
import { parseAnalysisContent } from "@/types/api/analysis";

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
    // Get minutes in the appropriate language
    const minutes = React.useMemo((): MeetingMinutesContent | null => {
        if (!minutesAnalysis) return null;

        let content = minutesAnalysis.content;
        if (displayLanguage && minutesAnalysis.translations[displayLanguage]) {
            content = minutesAnalysis.translations[displayLanguage];
        }

        return parseAnalysisContent<MeetingMinutesContent>(content);
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

            {/* Minutes content */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Key Topics */}
                    {minutes?.keyTopics && minutes.keyTopics.length > 0 && (
                        <section>
                            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground mb-3">
                                <span>📌</span> Key Topics
                            </h3>
                            <ul className="space-y-2">
                                {minutes.keyTopics.map((topic, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-start gap-2 text-sm text-muted-foreground"
                                    >
                                        <span className="text-primary mt-1">•</span>
                                        <span>{topic}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Decisions */}
                    {minutes?.decisions && minutes.decisions.length > 0 && (
                        <section>
                            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground mb-3">
                                <span>✅</span> Decisions Made
                            </h3>
                            <ul className="space-y-2">
                                {minutes.decisions.map((decision, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-start gap-2 text-sm text-muted-foreground"
                                    >
                                        <span className="text-success mt-1">•</span>
                                        <span>{decision}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Open Questions */}
                    {minutes?.openQuestions && minutes.openQuestions.length > 0 && (
                        <section>
                            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground mb-3">
                                <span>❓</span> Open Questions
                            </h3>
                            <ul className="space-y-2">
                                {minutes.openQuestions.map((question, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-start gap-2 text-sm text-muted-foreground"
                                    >
                                        <span className="text-warning mt-1">•</span>
                                        <span>{question}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {!minutes && (
                        <p className="text-center text-muted-foreground py-8">
                            Unable to parse meeting minutes.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
