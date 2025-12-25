"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { NavArrowDown, NavArrowUp, EmojiSatisfied, EmojiSad } from "iconoir-react";
import type { TranscriptionAnalysisDto, SentimentResult } from "@/types/api/analysis";
import { parseAnalysisContent } from "@/types/api/analysis";

interface TLDRCardProps {
    summaryAnalysis: TranscriptionAnalysisDto | undefined;
    sentimentAnalysis: TranscriptionAnalysisDto | undefined;
    displayLanguage: string | null;
    isVisible: boolean;
    onToggle: () => void;
    className?: string;
}

// Get sentiment icon and color
function getSentimentDisplay(tone: string | undefined) {
    switch (tone) {
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
    isVisible,
    onToggle,
    className,
}: TLDRCardProps) {
    // Get summary text in the appropriate language
    const summaryText = React.useMemo(() => {
        if (!summaryAnalysis) return null;

        if (displayLanguage && summaryAnalysis.translations[displayLanguage]) {
            return summaryAnalysis.translations[displayLanguage];
        }
        return summaryAnalysis.content;
    }, [summaryAnalysis, displayLanguage]);

    // Parse sentiment
    const sentiment = React.useMemo(() => {
        if (!sentimentAnalysis) return null;
        return parseAnalysisContent<SentimentResult>(sentimentAnalysis.content);
    }, [sentimentAnalysis]);

    const sentimentDisplay = getSentimentDisplay(sentiment?.tone);

    if (!summaryAnalysis) {
        return null;
    }

    return (
        <div className={cn("border border-border rounded-lg bg-card/50", className)}>
            {/* Header - always visible */}
            <button
                onClick={onToggle}
                className={cn(
                    "w-full flex items-center justify-between px-4 py-3",
                    "text-left hover:bg-muted/50 transition-colors",
                    "rounded-t-lg",
                    !isVisible && "rounded-b-lg"
                )}
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg">🚀</span>
                    <span className="text-sm font-medium text-foreground">TL;DR</span>

                    {/* Sentiment badge */}
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
                                {sentiment.tone}
                            </span>
                        </div>
                    )}
                </div>

                {isVisible ? (
                    <NavArrowUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <NavArrowDown className="h-4 w-4 text-muted-foreground" />
                )}
            </button>

            {/* Content - collapsible */}
            {isVisible && (
                <div className="px-4 pb-4 pt-1">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {summaryText}
                    </p>

                    {/* Emotions */}
                    {sentiment?.emotions && sentiment.emotions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {sentiment.emotions.map((emotion, idx) => (
                                <span
                                    key={idx}
                                    className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                                >
                                    {emotion}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
