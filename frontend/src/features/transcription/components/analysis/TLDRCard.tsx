"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { NavArrowDown, NavArrowUp, EmojiSatisfied, EmojiSad } from "iconoir-react";
import type { TranscriptionAnalysisDto, ShortSummaryContent, SentimentContent } from "@/types/api/analysis";
import { parseAnalysisContent } from "@/types/api/analysis";

interface TLDRCardProps {
    summaryAnalysis: TranscriptionAnalysisDto | undefined;
    sentimentAnalysis: TranscriptionAnalysisDto | undefined;
    displayLanguage: string | null;
    className?: string;
}

function getSentimentDisplay(sentiment: string | undefined) {
    switch (sentiment) {
        case "Positive":
            return { Icon: EmojiSatisfied, color: "text-success", bg: "bg-success/10" };
        case "Negative":
            return { Icon: EmojiSad, color: "text-destructive", bg: "bg-destructive/10" };
        default:
            return { Icon: null, color: "text-muted-foreground", bg: "bg-muted" };
    }
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

    const sentimentDisplay = getSentimentDisplay(sentiment?.sentiment);

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

                    {sentiment && (
                        <div className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded-full",
                            sentimentDisplay.bg
                        )}>
                            {sentimentDisplay.Icon ? (
                                <sentimentDisplay.Icon className={cn("h-3.5 w-3.5", sentimentDisplay.color)} />
                            ) : (
                                <span className={cn("text-xs", sentimentDisplay.color)}>😐</span>
                            )}
                            <span className={cn("text-xs font-medium", sentimentDisplay.color)}>
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
