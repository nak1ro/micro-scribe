import * as React from "react";
import { cn } from "@/lib/utils";
import type { LongSummaryContent, LongSummarySection } from "@/features/transcription/types/analysis";
import { parseAnalysisContent } from "@/features/transcription/types/analysis";

interface LongSummaryViewProps {
    content: string;
}

export function LongSummaryView({ content }: LongSummaryViewProps) {
    const parsed = parseAnalysisContent<LongSummaryContent>(content);

    if (!parsed?.sections || parsed.sections.length === 0) {
        return <p className="text-sm text-muted-foreground">{content}</p>;
    }

    return (
        <div className="space-y-4">
            {parsed.sections.map((section: LongSummarySection, idx: number) => (
                <div
                    key={idx}
                    className={cn(
                        "p-5 rounded-xl border border-border/50",
                        "bg-card/30 backdrop-blur-sm",
                        "hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                    )}
                >
                    <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {section.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-4">
                        {section.content}
                    </p>
                </div>
            ))}
        </div>
    );
}
