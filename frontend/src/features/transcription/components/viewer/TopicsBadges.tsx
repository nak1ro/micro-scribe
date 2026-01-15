"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TranscriptionAnalysisDto, TopicsContent } from "@/features/transcription/types";
import { parseAnalysisContent } from "@/features/transcription/types";

interface TopicsBadgesProps {
    topicsAnalysis: TranscriptionAnalysisDto | undefined;
    displayLanguage: string | null;
    onTopicClick?: (topic: string) => void;
    className?: string;
}

export function TopicsBadges({
    topicsAnalysis,
    displayLanguage,
    onTopicClick,
    className,
}: TopicsBadgesProps) {
    // Get topics in appropriate language
    const topics = React.useMemo(() => {
        if (!topicsAnalysis) return [];

        let content = topicsAnalysis.content;
        if (displayLanguage && topicsAnalysis.translations[displayLanguage]) {
            content = topicsAnalysis.translations[displayLanguage];
        }

        const parsed = parseAnalysisContent<TopicsContent>(content);
        return parsed?.topics ?? [];
    }, [topicsAnalysis, displayLanguage]);

    if (!topicsAnalysis || topics.length === 0) {
        return null;
    }

    return (
        <div className={cn("flex flex-wrap gap-1.5", className)}>
            {topics.map((topic, idx) => (
                <button
                    key={idx}
                    onClick={() => onTopicClick?.(topic)}
                    className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        "bg-primary/10 text-primary",
                        "hover:bg-primary/20 transition-colors",
                        !onTopicClick && "cursor-default"
                    )}
                >
                    #{topic}
                </button>
            ))}
        </div>
    );
}
