"use client";

import { cn } from "@/lib/utils";
import type { TranscriptionAnalysisDto } from "@/features/transcription/types";
import { useTopics } from "@/features/transcription/hooks/useTopics";

interface TopicsBadgesProps {
    topicsAnalysis: TranscriptionAnalysisDto | undefined;
    displayLanguage: string | null;
    onTopicClick?: (topic: string) => void;
    className?: string;
}

const badgeClasses = cn(
    "px-2 py-0.5 rounded-full text-xs font-medium",
    "bg-primary/10 text-primary",
    "hover:bg-primary/20 transition-colors"
);

export function TopicsBadges({ topicsAnalysis, displayLanguage, onTopicClick, className }: TopicsBadgesProps) {
    const topics = useTopics({ topicsAnalysis, displayLanguage });

    if (topics.length === 0) return null;

    return (
        <div className={cn("flex flex-wrap gap-1.5", className)}>
            {topics.map((topic, idx) => (
                <button
                    key={idx}
                    onClick={() => onTopicClick?.(topic)}
                    className={cn(badgeClasses, !onTopicClick && "cursor-default")}
                >
                    #{topic}
                </button>
            ))}
        </div>
    );
}
