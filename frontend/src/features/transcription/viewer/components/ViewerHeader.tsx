"use client";

import * as React from "react";
import { ArrowLeft, Clock, Globe, Menu } from "iconoir-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { formatTime, getLanguageName } from "@/lib/utils";
import { getStatusInfo } from "@/features/transcription/utils";
import type { TranscriptionData } from "@/features/transcription/types";

interface ViewerHeaderProps {
    data: TranscriptionData;
    onBack: () => void;
    onToggleSidebar: () => void;
    className?: string;
}

export function ViewerHeader({ data, onBack, onToggleSidebar, className }: ViewerHeaderProps) {
    const statusInfo = getStatusInfo(data.status);
    const languageName = getLanguageName(data.sourceLanguage);
    const formattedDuration = formatTime(data.durationSeconds);

    return (
        <header
            className={cn(
                "flex items-center justify-between px-4 gap-4 md:px-6 h-16",
                "bg-background/80 backdrop-blur-sm",
                "border-b border-border",
                "sticky top-0 z-20",
                className
            )}
        >
            <div className="flex items-center gap-4 min-w-0">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="shrink-0 gap-2 text-muted-foreground hover:text-foreground pl-0 md:pl-2"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="hidden sm:inline">Back</span>
                </Button>

                {/* File Name */}
                <div className="min-w-0">
                    <h1 className="text-base md:text-lg font-semibold text-foreground truncate">
                        {data.fileName}
                    </h1>
                </div>

                {/* Status Badge */}
                <div
                    className={cn(
                        "shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                        "text-xs font-medium",
                        "bg-muted"
                    )}
                >
                    <span
                        className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            data.status === "completed" && "bg-success",
                            data.status === "processing" && "bg-info animate-pulse",
                            data.status === "pending" && "bg-warning",
                            data.status === "failed" && "bg-destructive"
                        )}
                    />
                    <span className={statusInfo.color}>{statusInfo.label}</span>
                </div>
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
