"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
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

    // Handle async states
    if (minutesAnalysis.status === "Pending" || minutesAnalysis.status === "Processing") {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground animate-pulse">
                        {minutesAnalysis.status === "Pending" ? "Queued for analysis..." : "Compiling minutes..."}
                    </p>
                </div>
            </div>
        );
    }

    if (minutesAnalysis.status === "Failed") {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="p-3 bg-destructive/10 rounded-full text-destructive">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12.01" y1="8" y2="8" /><line x1="12" y1="12" x2="12" y2="16" /></svg>
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">Analysis Failed</p>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                            {minutesAnalysis.errorMessage || "An unexpected error occurred while generating meeting minutes."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col h-full", className)}>
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
