"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TranscriptionAnalysisDto } from "@/types/api/analysis";

interface TopicsBadgesProps {
    topicsAnalysis: TranscriptionAnalysisDto | undefined;
    displayLanguage: string | null;
    className?: string;
}

export function TopicsBadges({
    topicsAnalysis,
    displayLanguage,
    className,
}: TopicsBadgesProps) {
    // Get topics in the appropriate language
    const topics = React.useMemo(() => {
        if (!topicsAnalysis) return [];

        let content = topicsAnalysis.content;
        if (displayLanguage && topicsAnalysis.translations[displayLanguage]) {
            content = topicsAnalysis.translations[displayLanguage];
        }

        // Parse JSON array
        try {
            const parsed = JSON.parse(content);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            // If not valid JSON, try splitting by comma
            return content.split(",").map(t => t.trim()).filter(Boolean);
        }
    }, [topicsAnalysis, displayLanguage]);

    if (!topics.length) {
        return null;
    }

    return (
        <div className={cn("flex flex-wrap gap-1.5", className)}>
            {topics.map((topic, idx) => (
                <span
                    key={idx}
                    className={cn(
                        "inline-flex items-center gap-1",
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        "bg-primary/10 text-primary",
                        "hover:bg-primary/20 transition-colors cursor-default"
                    )}
                >
                    <span className="text-[10px]">#</span>
                    {topic}
                </span>
            ))}
        </div>
    );
}
