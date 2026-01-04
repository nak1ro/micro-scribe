"use client";

import * as React from "react";
import { Clock, Globe, Menu } from "iconoir-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { formatTime, getLanguageName } from "@/lib/utils";
import { getStatusInfo } from "@/features/transcription/utils";
import type { TranscriptionData } from "@/features/transcription/types";

// Map analysis types to display titles
const analysisViewTitles: Record<string, string> = {
    ActionItems: "📋 Action Items",
    MeetingMinutes: "📝 Meeting Minutes",
    ShortSummary: "💡 TL;DR Summary",
    LongSummary: "📄 Detailed Summary",
    Topics: "🏷️ Topics & Tags",
    Sentiment: "😊 Sentiment Analysis",
};

interface ViewerHeaderProps {
    data: TranscriptionData;
    onToggleSidebar: () => void;
    // Analysis view context (for title display only, no navigation)
    currentAnalysisView?: string;
    className?: string;
}

export function ViewerHeader({
    data,
    onToggleSidebar,
    currentAnalysisView,
    className
}: ViewerHeaderProps) {
    const statusInfo = getStatusInfo(data.status);
    const languageName = getLanguageName(data.sourceLanguage);
    const formattedDuration = formatTime(data.durationSeconds);

    // Check if we're viewing an analysis (not transcript)
    const isInAnalysisView = currentAnalysisView && currentAnalysisView !== "transcript";
    const analysisTitle = isInAnalysisView ? analysisViewTitles[currentAnalysisView] || "Analysis" : null;

    return (
        <header
            className={cn(
                "flex items-center justify-between px-4 gap-4 md:px-6 h-16 min-h-16 shrink-0",
                "bg-background/80 backdrop-blur-sm",
                "border-b border-border",
                "sticky top-0 z-20",
                className
            )}
        >
            {/* Title Section */}
            <div className="min-w-0 flex items-center gap-2">
                {/* Title - consistent structure for both views */}
                <h1 className="text-base md:text-lg font-semibold text-foreground truncate">
                    {isInAnalysisView ? analysisTitle : data.fileName}
                </h1>
                {/* Secondary text - filename when in analysis view */}
                {isInAnalysisView && (
                    <span className="hidden md:block text-sm text-muted-foreground truncate">
                        {data.fileName}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4">
                {/* Duration & Language - hidden on mobile */}
                <div className="hidden lg:flex items-center gap-4 shrink-0 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{formattedDuration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Globe className="h-4 w-4" />
                        <span>{languageName}</span>
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    className="lg:hidden shrink-0 text-muted-foreground hover:text-foreground"
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </div>
        </header>
    );
}
