"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TranscriptionAnalysisDto, ShortSummaryContent, LongSummaryContent, TopicsContent, SentimentContent } from "@/types/api/analysis";
import { parseAnalysisContent } from "@/types/api/analysis";

interface AnalysisContentViewProps {
    analysis: TranscriptionAnalysisDto | undefined;
    analysisType: string;
    displayLanguage: string | null;
    onBack: () => void;
    className?: string;
}

// Color palette for topic tags
const topicColors = [
    "bg-primary/10 text-primary hover:bg-primary/20",
    "bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20",
    "bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20",
    "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20",
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20",
];

export function AnalysisContentView({
    analysis,
    analysisType,
    displayLanguage,
    onBack,
    className,
}: AnalysisContentViewProps) {
    // Get content in appropriate language
    const content = React.useMemo(() => {
        if (!analysis) return null;

        let rawContent = analysis.content;
        if (displayLanguage && analysis.translations[displayLanguage]) {
            rawContent = analysis.translations[displayLanguage];
        }

        return rawContent;
    }, [analysis, displayLanguage]);

    // Render based on type
    const renderContent = () => {
        if (!analysis) {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                        <span className="text-2xl opacity-50">📊</span>
                    </div>
                    <p className="text-muted-foreground">
                        No {analysisType} analysis available.
                    </p>
                </div>
            );
        }

        // Handle async states
        if (analysis.status === "Pending" || analysis.status === "Processing") {
            return (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="relative">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg">✨</span>
                        </div>
                    </div>
                    <p className="text-muted-foreground animate-pulse font-medium">
                        {analysis.status === "Pending" ? "Queued for analysis..." : "AI is thinking..."}
                    </p>
                </div>
            );
        }

        if (analysis.status === "Failed") {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 bg-destructive/10 rounded-2xl mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" x2="12.01" y1="8" y2="8" />
                            <line x1="12" y1="12" x2="12" y2="16" />
                        </svg>
                    </div>
                    <p className="font-semibold text-foreground mb-1">Analysis Failed</p>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        {analysis.errorMessage || "An unexpected error occurred."}
                    </p>
                </div>
            );
        }

        if (!content) {
            return (
                <p className="text-center text-muted-foreground py-12">
                    No content available.
                </p>
            );
        }

        switch (analysisType) {
            case "ShortSummary": {
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

            case "LongSummary": {
                const parsed = parseAnalysisContent<LongSummaryContent>(content);
                return (
                    <div className="space-y-4">
                        {parsed?.sections?.map((section, idx) => (
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
                        )) || <p className="text-sm text-muted-foreground">{content}</p>}
                    </div>
                );
            }

            case "Topics": {
                const parsed = parseAnalysisContent<TopicsContent>(content);
                const topics = parsed?.topics || [];
                return (
                    <div className="space-y-4">
                        {/* Topics cloud */}
                        <div className="p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
                            <div className="flex flex-wrap gap-2">
                                {topics.map((topic, idx) => (
                                    <span
                                        key={idx}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-sm font-medium",
                                            "transition-all duration-200 cursor-default",
                                            "hover:scale-105 hover:shadow-md",
                                            topicColors[idx % topicColors.length]
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

            case "Sentiment": {
                const parsed = parseAnalysisContent<SentimentContent>(content);
                const sentiment = parsed?.sentiment || "Neutral";
                const confidence = parsed?.confidenceScore || 0;

                const sentimentConfigs = {
                    Positive: {
                        gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
                        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                        bar: "bg-gradient-to-r from-emerald-500 to-emerald-400",
                        emoji: "😊",
                    },
                    Negative: {
                        gradient: "from-red-500/20 via-red-500/10 to-transparent",
                        badge: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
                        bar: "bg-gradient-to-r from-red-500 to-red-400",
                        emoji: "😔",
                    },
                    Neutral: {
                        gradient: "from-slate-500/20 via-slate-500/10 to-transparent",
                        badge: "bg-muted text-muted-foreground border-border",
                        bar: "bg-gradient-to-r from-slate-400 to-slate-300",
                        emoji: "😐",
                    },
                };
                const sentimentConfig = sentimentConfigs[sentiment as keyof typeof sentimentConfigs] || sentimentConfigs.Neutral;

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

            default:
                return <p className="text-sm text-muted-foreground">{content}</p>;
        }
    };

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-3xl mx-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
