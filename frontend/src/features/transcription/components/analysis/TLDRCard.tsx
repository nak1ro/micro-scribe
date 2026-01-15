"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { NavArrowDown, NavArrowUp } from "iconoir-react";
import type { TranscriptionAnalysisDto, ShortSummaryContent, SentimentContent } from "@/features/transcription/types/analysis";
import { parseAnalysisContent } from "@/features/transcription/types/analysis";
import { getSentimentConfig } from "./constants";

interface TLDRCardProps {
    summaryAnalysis: TranscriptionAnalysisDto | undefined;
    sentimentAnalysis: TranscriptionAnalysisDto | undefined;
    displayLanguage: string | null;
    className?: string;
}

export function TLDRCard({
    summaryAnalysis,
    sentimentAnalysis,
    displayLanguage,
    className,
}: TLDRCardProps) {
    const [isExpanded, setIsExpanded] = React.useState(true);

    // Get summary text in appropriate language
    const summaryText = React.useMemo(() => {
        if (!summaryAnalysis) return null;

        let content = summaryAnalysis.content;
        if (displayLanguage && summaryAnalysis.translations[displayLanguage]) {
            content = summaryAnalysis.translations[displayLanguage];
        }

        const parsed = parseAnalysisContent<ShortSummaryContent>(content);
        return parsed?.summary ?? null;
    }, [summaryAnalysis, displayLanguage]);

    // Get sentiment
    const sentiment = React.useMemo(() => {
        if (!sentimentAnalysis) return null;

        let content = sentimentAnalysis.content;
        if (displayLanguage && sentimentAnalysis.translations[displayLanguage]) {
            content = sentimentAnalysis.translations[displayLanguage];
        }

        return parseAnalysisContent<SentimentContent>(content);
    }, [sentimentAnalysis, displayLanguage]);

    const sentimentConfig = sentiment ? getSentimentConfig(sentiment.sentiment) : null;

    if (!summaryAnalysis && !sentimentAnalysis) {
        return null;
    }

    return (
        <div className={cn(
            "rounded-lg border border-border bg-card",
            className
        )}>
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg">💡</span>
                    <span className="font-medium text-foreground">TL;DR</span>

                    {sentiment && sentimentConfig && (
                        <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border",
                            sentimentConfig.badge
                        )}>
                            <span className="text-xs">{sentimentConfig.emoji}</span>
                            <span className="text-xs font-medium">
                                {sentiment.sentiment}
                            </span>
                        </div>
                    )}
                </div>

                {isExpanded ? (
                    <NavArrowUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <NavArrowDown className="h-4 w-4 text-muted-foreground" />
                )}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                    {summaryText && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {summaryText}
                        </p>
                    )}

                    {sentiment?.explanation && (
                        <div className="pt-2 border-t border-border">
                            <p className="text-xs text-muted-foreground">
                                <span className="font-medium">Sentiment: </span>
                                {sentiment.explanation}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

