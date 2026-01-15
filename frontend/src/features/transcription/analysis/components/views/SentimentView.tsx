import * as React from "react";
import { cn } from "@/lib/utils";
import type { SentimentContent } from "@/features/transcription/types/analysis";
import { parseAnalysisContent } from "@/features/transcription/types/analysis";
import { getSentimentConfig } from "../../constants";

interface SentimentViewProps {
    content: string;
}

export function SentimentView({ content }: SentimentViewProps) {
    const parsed = parseAnalysisContent<SentimentContent>(content);
    const sentiment = parsed?.sentiment || "Neutral";
    const confidence = parsed?.confidenceScore || 0;
    const sentimentConfig = getSentimentConfig(sentiment);

    return (
        <div className="space-y-6">
            {/* Main sentiment card */}
            <div className={cn(
                "relative p-6 rounded-2xl border border-border/50 overflow-hidden",
                "bg-card/30 backdrop-blur-sm"
            )}>
                {/* Gradient background */}
                <div className={cn("absolute inset-0 bg-gradient-to-br", sentimentConfig.gradient)} />

                <div className="relative space-y-4">
                    {/* Sentiment badge */}
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{sentimentConfig.emoji}</span>
                        <span className={cn(
                            "px-5 py-2 rounded-full text-lg font-bold border",
                            sentimentConfig.badge
                        )}>
                            {sentiment}
                        </span>
                    </div>

                    {/* Confidence gauge */}
                    {parsed?.confidenceScore !== undefined && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Confidence</span>
                                <span className="font-semibold text-foreground">
                                    {(confidence * 100).toFixed(0)}%
                                </span>
                            </div>
                            <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-500", sentimentConfig.bar)}
                                    style={{ width: `${confidence * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Explanation */}
            {parsed?.explanation && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {parsed.explanation}
                    </p>
                </div>
            )}
        </div>
    );
}
