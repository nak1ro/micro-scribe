"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TranscriptionAnalysisDto } from "@/features/transcription/types/analysis";
import { AnalysisLoading, AnalysisError, AnalysisEmpty } from "../shared/AnalysisStates";
import { ShortSummaryView } from "./ShortSummaryView";
import { LongSummaryView } from "./LongSummaryView";
import { TopicsView } from "./TopicsView";
import { SentimentView } from "./SentimentView";

interface AnalysisContentViewProps {
    analysis: TranscriptionAnalysisDto | undefined;
    analysisType: string;
    displayLanguage: string | null;
    className?: string;
}

export function AnalysisContentView({
    analysis,
    analysisType,
    displayLanguage,
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

    // Handle initial/loading/error states
    if (!analysis) {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                <AnalysisEmpty icon="📊">
                    No {analysisType} analysis available.
                </AnalysisEmpty>
            </div>
        );
    }

    if (analysis.status === "Pending" || analysis.status === "Processing") {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                <div className="flex-1 flex flex-col items-center justify-center">
                    <AnalysisLoading>
                        {analysis.status === "Pending" ? "Queued for analysis..." : "AI is thinking..."}
                    </AnalysisLoading>
                </div>
            </div>
        );
    }

    if (analysis.status === "Failed") {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                <div className="flex-1 flex flex-col items-center justify-center">
                    <AnalysisError message={analysis.errorMessage || undefined} />
                </div>
            </div>
        );
    }

    if (!content) {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                <AnalysisEmpty>
                    No content available.
                </AnalysisEmpty>
            </div>
        );
    }

    // Render based on type
    const renderContent = () => {
        switch (analysisType) {
            case "ShortSummary":
                return <ShortSummaryView content={content} />;
            case "LongSummary":
                return <LongSummaryView content={content} />;
            case "Topics":
                return <TopicsView content={content} />;
            case "Sentiment":
                return <SentimentView content={content} />;
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
