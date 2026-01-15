import * as React from "react";
import type { ShortSummaryContent } from "@/features/transcription/types/analysis";
import { parseAnalysisContent } from "@/features/transcription/types/analysis";

interface ShortSummaryViewProps {
    content: string;
}

export function ShortSummaryView({ content }: ShortSummaryViewProps) {
    const parsed = parseAnalysisContent<ShortSummaryContent>(content);

    return (
        <div className="relative">
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 rounded-2xl" />

            {/* Card container */}
            <div className="relative p-6 md:p-8 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
                {/* Quote decoration */}
                <span className="absolute top-4 left-4 text-4xl text-primary/20 font-serif leading-none">"</span>

                {/* Summary text */}
                <p className="text-lg md:text-xl text-foreground leading-relaxed pl-8 md:pl-10">
                    {parsed?.summary || content}
                </p>
            </div>
        </div>
    );
}
