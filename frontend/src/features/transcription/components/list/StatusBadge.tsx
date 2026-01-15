"use client";

import * as React from "react";
import {
    Clock,
    RefreshDouble,
    CheckCircle,
    XmarkCircle,
    Prohibition
} from "iconoir-react";
import { cn } from "@/lib/utils";
import { getProcessingStepText } from "@/features/transcription/utils";
import type { TranscriptionStatus } from "@/types/models/transcription";

interface StatusBadgeProps {
    status: TranscriptionStatus;
    processingStep?: string | null;
}

export function StatusBadge({ status, processingStep }: StatusBadgeProps) {
    const config: Record<TranscriptionStatus, {
        icon: React.ComponentType<{ className?: string }>;
        className: string;
    }> = {
        uploading: {
            icon: RefreshDouble,
            className: "bg-primary/10 text-primary",
        },
        pending: {
            icon: Clock,
            className: "bg-warning/10 text-warning",
        },
        processing: {
            icon: RefreshDouble,
            className: "bg-info/10 text-info",
        },
        completed: {
            icon: CheckCircle,
            className: "bg-success/10 text-success",
        },
        failed: {
            icon: XmarkCircle,
            className: "bg-destructive/10 text-destructive",
        },
        cancelled: {
            icon: Prohibition,
            className: "bg-muted text-muted-foreground",
        },
    };

    const { icon: Icon, className } = config[status];
    const isAnimated = status === "processing" || status === "uploading";
    const label = getProcessingStepText(status, processingStep ?? null);

    return (
        <span className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
            className
        )}>
            <Icon className={cn("h-3 w-3", isAnimated && "animate-spin")} />
            {label}
        </span>
    );
}
