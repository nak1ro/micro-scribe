import * as React from "react";
import { cn } from "@/lib/utils";
import type { TopicsContent } from "@/features/transcription/types/analysis";
import { parseAnalysisContent } from "@/features/transcription/types/analysis";
import { TOPIC_COLORS } from "../../constants";

interface TopicsViewProps {
    content: string;
}

export function TopicsView({ content }: TopicsViewProps) {
    const parsed = parseAnalysisContent<TopicsContent>(content);
    const topics = parsed?.topics || [];

    return (
        <div className="space-y-4">
            {/* Topics cloud */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
                <div className="flex flex-wrap gap-2">
                    {topics.map((topic: string, idx: number) => (
                        <span
                            key={idx}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium",
                                "transition-all duration-200 cursor-default",
                                "hover:scale-105 hover:shadow-md",
                                TOPIC_COLORS[idx % TOPIC_COLORS.length]
                            )}
                        >
                            #{topic}
                        </span>
                    ))}
                </div>
                {topics.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No topics found.</p>
                )}
            </div>

            {/* Topic count badge */}
            {topics.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                    {topics.length} topic{topics.length !== 1 ? "s" : ""} identified
                </p>
            )}
        </div>
    );
}
