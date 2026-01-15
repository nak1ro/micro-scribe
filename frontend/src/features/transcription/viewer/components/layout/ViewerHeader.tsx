"use client";

import Link from "next/link";
import { Clock, Globe, Menu, ArrowLeft } from "iconoir-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { formatTime, getLanguageName } from "@/lib/utils";
import { getStatusInfo } from "@/features/transcription/utils";
import { ANALYSIS_VIEW_TITLES } from "@/features/transcription/constants";
import type { TranscriptionData } from "@/features/transcription/types";

interface ViewerHeaderProps {
    data: TranscriptionData;
    onToggleSidebar: () => void;
    currentAnalysisView?: string;
    className?: string;
}

const headerClasses = cn(
    "flex items-center justify-between px-4 gap-4 md:px-6 h-16 min-h-16 shrink-0",
    "bg-background/80 backdrop-blur-sm",
    "border-b border-border",
    "sticky top-0 z-20"
);

export function ViewerHeader({ data, onToggleSidebar, currentAnalysisView, className }: ViewerHeaderProps) {
    const languageName = getLanguageName(data.sourceLanguage);
    const formattedDuration = formatTime(data.durationSeconds);

    const isInAnalysisView = currentAnalysisView && currentAnalysisView !== "transcript";
    const analysisTitle = isInAnalysisView ? ANALYSIS_VIEW_TITLES[currentAnalysisView] || "Analysis" : null;

    return (
        <header className={cn(headerClasses, className)}>
            {/* Title Section */}
            <div className="min-w-0 flex items-center gap-2">
                {/* Back Button (Mobile only) */}
                <Link href="/dashboard" className="lg:hidden mr-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 text-muted-foreground">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>

                <h1 className="text-base md:text-lg font-semibold text-foreground truncate">
                    {isInAnalysisView ? analysisTitle : data.fileName}
                </h1>
                {isInAnalysisView && (
                    <span className="hidden md:block text-sm text-muted-foreground truncate">
                        {data.fileName}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4">
                {/* Duration & Language - desktop only */}
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
