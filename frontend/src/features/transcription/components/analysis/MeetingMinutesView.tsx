"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Pin, Check, HelpCircle, WarningTriangle } from "iconoir-react";
import type { TranscriptionAnalysisDto, MeetingMinutesContent } from "@/types/api/analysis";
import { parseAnalysisContent } from "@/types/api/analysis";

interface MeetingMinutesViewProps {
    minutesAnalysis: TranscriptionAnalysisDto | undefined;
    displayLanguage: string | null;
    onBack: () => void;
    className?: string;
}

export function MeetingMinutesView({
    minutesAnalysis,
    displayLanguage,
    onBack,
    className,
}: MeetingMinutesViewProps) {
    // Get minutes in the appropriate language
    const minutes = React.useMemo((): MeetingMinutesContent | null => {
        if (!minutesAnalysis) return null;

        let content = minutesAnalysis.content;
        if (displayLanguage && minutesAnalysis.translations[displayLanguage]) {
            content = minutesAnalysis.translations[displayLanguage];
        }

        return parseAnalysisContent<MeetingMinutesContent>(content);
    }, [minutesAnalysis, displayLanguage]);

    if (!minutesAnalysis) {
        return (
            <div className={cn("flex flex-col items-center justify-center py-16", className)}>
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <span className="text-2xl opacity-50">📝</span>
                </div>
                <p className="text-muted-foreground">No meeting minutes generated yet.</p>
            </div>
        );
    }

    // Handle async states
    if (minutesAnalysis.status === "Pending" || minutesAnalysis.status === "Processing") {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg">📝</span>
                        </div>
                    </div>
                    <p className="text-muted-foreground animate-pulse font-medium">
                        {minutesAnalysis.status === "Pending" ? "Queued for analysis..." : "Compiling minutes..."}
                    </p>
                </div>
            </div>
        );
    }

    if (minutesAnalysis.status === "Failed") {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="p-4 bg-destructive/10 rounded-2xl mb-4">
                        <WarningTriangle className="w-8 h-8 text-destructive" />
                    </div>
                    <p className="font-semibold text-foreground mb-1">Analysis Failed</p>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        {minutesAnalysis.errorMessage || "An unexpected error occurred."}
                    </p>
                </div>
            </div>
        );
    }

    // Section configurations
    const sections = [
        {
            key: "keyTopics",
            data: minutes?.keyTopics,
            icon: Pin,
            title: "Key Topics",
            borderColor: "border-l-violet-500",
            bgColor: "bg-violet-500/5",
            iconColor: "text-violet-500",
            bulletColor: "bg-violet-500",
        },
        {
            key: "decisions",
            data: minutes?.decisions,
            icon: Check,
            title: "Decisions Made",
            borderColor: "border-l-emerald-500",
            bgColor: "bg-emerald-500/5",
            iconColor: "text-emerald-500",
            bulletColor: "bg-emerald-500",
        },
        {
            key: "openQuestions",
            data: minutes?.openQuestions,
            icon: HelpCircle,
            title: "Open Questions",
            borderColor: "border-l-amber-500",
            bgColor: "bg-amber-500/5",
            iconColor: "text-amber-500",
            bulletColor: "bg-amber-500",
        },
    ];

    const hasContent = sections.some(s => s.data && s.data.length > 0);

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Minutes content */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-3xl mx-auto space-y-4">
                    {sections.map((section) => {
                        if (!section.data || section.data.length === 0) return null;

                        const Icon = section.icon;

                        return (
                            <div
                                key={section.key}
                                className={cn(
                                    "rounded-xl border border-border/50 overflow-hidden",
                                    "bg-card/30 backdrop-blur-sm",
                                    "hover:shadow-sm transition-shadow duration-200"
                                )}
                            >
                                {/* Section header */}
                                <div className={cn(
                                    "flex items-center gap-3 px-5 py-3",
                                    "border-l-4",
                                    section.borderColor,
                                    section.bgColor
                                )}>
                                    <Icon className={cn("w-5 h-5", section.iconColor)} />
                                    <h3 className="text-sm font-semibold text-foreground">
                                        {section.title}
                                    </h3>
                                    <span className="ml-auto text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-background/50">
                                        {section.data.length}
                                    </span>
                                </div>

                                {/* Section items */}
                                <div className="px-5 py-3 space-y-2.5">
                                    {section.data.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-3 group"
                                        >
                                            <span className={cn(
                                                "w-1.5 h-1.5 rounded-full mt-2 shrink-0",
                                                "transition-transform duration-200 group-hover:scale-125",
                                                section.bulletColor
                                            )} />
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {item}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {!hasContent && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                <span className="text-2xl">📄</span>
                            </div>
                            <p className="text-muted-foreground">
                                Unable to parse meeting minutes.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
