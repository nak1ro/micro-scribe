"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "iconoir-react";
import type { TranscriptionAnalysisDto, ShortSummaryContent, LongSummaryContent, TopicsContent, SentimentContent } from "@/types/api/analysis";
import { parseAnalysisContent } from "@/types/api/analysis";

interface AnalysisContentViewProps {
    analysis: TranscriptionAnalysisDto | undefined;
    analysisType: string;
    displayLanguage: string | null;
    onBack: () => void;
    className?: string;
}

// Generic view for simple analysis types (Summary, Topics, Sentiment)
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
        if (!content) {
            return (
                <p className="text-center text-muted-foreground py-8">
                    No {analysisType} analysis available.
                </p>
            );
        }

        switch (analysisType) {
            case "ShortSummary": {
                const parsed = parseAnalysisContent<ShortSummaryContent>(content);
                return (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-base text-foreground leading-relaxed">
                            {parsed?.summary || content}
                        </p>
                    </div>
                );
            }

            case "LongSummary": {
                const parsed = parseAnalysisContent<LongSummaryContent>(content);
                return (
                    <div className="space-y-6">
                        {parsed?.sections?.map((section, idx) => (
                            <div key={idx}>
                                <h3 className="text-lg font-semibold text-foreground mb-2">{section.title}</h3>
                                <p className="text-sm text-muted-foreground">{section.content}</p>
                            </div>
                        )) || <p className="text-sm text-muted-foreground">{content}</p>}
                    </div>
                );
            }

            case "Topics": {
                const parsed = parseAnalysisContent<TopicsContent>(content);
                const topics = parsed?.topics || [];
                return (
                    <div className="flex flex-wrap gap-2">
                        {topics.map((topic, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary"
                            >
                                #{topic}
                            </span>
                        ))}
                        {topics.length === 0 && (
                            <p className="text-muted-foreground">No topics found.</p>
                        )}
                    </div>
                );
            }

            case "Sentiment": {
                const parsed = parseAnalysisContent<SentimentContent>(content);
                const sentimentColor = {
                    Positive: "text-success bg-success/10",
                    Negative: "text-destructive bg-destructive/10",
                    Neutral: "text-muted-foreground bg-muted",
                }[parsed?.sentiment || "Neutral"];

                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className={cn("px-4 py-2 rounded-full text-lg font-semibold", sentimentColor)}>
                                {parsed?.sentiment || "Unknown"}
                            </span>
                            {parsed?.confidenceScore && (
                                <span className="text-sm text-muted-foreground">
                                    {(parsed.confidenceScore * 100).toFixed(0)}% confidence
                                </span>
                            )}
                        </div>
                        {parsed?.explanation && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {parsed.explanation}
                            </p>
                        )}
                    </div>
                );
            }

            default:
                return <p className="text-sm text-muted-foreground">{content}</p>;
        }
    };

    const getTitle = () => {
        switch (analysisType) {
            case "ShortSummary": return "💡 TL;DR Summary";
            case "LongSummary": return "📄 Detailed Summary";
            case "Topics": return "🏷️ Topics & Tags";
            case "Sentiment": return "😊 Sentiment Analysis";
            default: return "Analysis";
        }
    };

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <button
                    onClick={onBack}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Back to transcript"
                >
                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </button>
                <h2 className="text-lg font-semibold text-foreground">{getTitle()}</h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-3xl mx-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
