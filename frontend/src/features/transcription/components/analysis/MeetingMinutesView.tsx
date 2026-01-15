"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TranscriptionAnalysisDto, MeetingMinutesContent } from "@/features/transcription/types/analysis";
import { parseAnalysisContent } from "@/features/transcription/types/analysis";
import { MEETING_SECTIONS_CONFIG } from "./constants";
import { AnalysisLoading, AnalysisError, AnalysisEmpty } from "./shared/AnalysisStates";
import { MeetingMinutesSection } from "./views/MeetingMinutesSection";

interface MeetingMinutesViewProps {
    minutesAnalysis: TranscriptionAnalysisDto | undefined;
    displayLanguage: string | null;
    className?: string;
}

export function MeetingMinutesView({
    minutesAnalysis,
    displayLanguage,
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
            <div className={cn("flex flex-col h-full", className)}>
                <AnalysisEmpty icon="📝">
                    No meeting minutes generated yet.
                </AnalysisEmpty>
            </div>
        );
    }

    if (minutesAnalysis.status === "Pending" || minutesAnalysis.status === "Processing") {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                <div className="flex-1 flex flex-col items-center justify-center">
                    <AnalysisLoading>
                        {minutesAnalysis.status === "Pending" ? "Queued for analysis..." : "Compiling minutes..."}
                    </AnalysisLoading>
                </div>
            </div>
        );
    }

    if (minutesAnalysis.status === "Failed") {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                <div className="flex-1 flex flex-col items-center justify-center">
                    <AnalysisError message={minutesAnalysis.errorMessage || undefined} />
                </div>
            </div>
        );
    }

    // Check if there is any content to display
    const hasContent = minutes && MEETING_SECTIONS_CONFIG.some(config => {
        const data = minutes[config.key];
        return data && data.length > 0;
    });

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Minutes content */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-3xl mx-auto space-y-4">
                    {MEETING_SECTIONS_CONFIG.map((config) => (
                        <MeetingMinutesSection
                            key={config.key}
                            config={config}
                            data={minutes?.[config.key]}
                        />
                    ))}

                    {!hasContent && (
                        <AnalysisEmpty icon="📄">
                            Unable to parse meeting minutes.
                        </AnalysisEmpty>
                    )}
                </div>
            </div>
        </div>
    );
}
