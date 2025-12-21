"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, Clock } from "lucide-react";
import { TranscriptionJobStatus } from "@/types/api/transcription";
import { StatusBadge } from "./StatusBadge";
import { formatDuration } from "./utils";

interface TranscriptionViewerHeaderProps {
    fileName: string;
    status: TranscriptionJobStatus;
    durationSeconds?: number;
    languageCode?: string;
    onBack: () => void;
    isVisible: boolean;
}

export function TranscriptionViewerHeader({
    fileName,
    status,
    durationSeconds,
    languageCode,
    onBack,
    isVisible,
}: TranscriptionViewerHeaderProps) {
    return (
        <div
            className={cn(
                "sticky top-0 bg-background z-10 pb-2 mb-6",
                "transition-transform duration-200 ease-out",
                isVisible ? "translate-y-0" : "-translate-y-full"
            )}
        >
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Dashboard</span>
            </button>

            <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">
                    {fileName}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <StatusBadge status={status} />
                    {durationSeconds && (
                        <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDuration(durationSeconds)}
                        </span>
                    )}
                    {languageCode && (
                        <span className="uppercase">{languageCode}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
