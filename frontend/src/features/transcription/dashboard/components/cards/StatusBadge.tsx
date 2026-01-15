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
import { Badge } from "@/components/ui/Badge";
import { getProcessingStepText } from "@/features/transcription/utils";
import type { TranscriptionStatus } from "@/types/models/transcription";

interface StatusBadgeProps {
    status: TranscriptionStatus;
    processingStep?: string | null;
}

const statusConfig: Record<TranscriptionStatus, {
    icon: React.ComponentType<{ className?: string }>;
    variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "muted";
    animate?: boolean;
}> = {
    uploading: {
        icon: RefreshDouble,
        variant: "default", // primary
        animate: true,
    },
    pending: {
        icon: Clock,
        variant: "warning",
    },
    processing: {
        icon: RefreshDouble,
        variant: "info",
        animate: true,
    },
    completed: {
        icon: CheckCircle,
        variant: "success",
    },
    failed: {
        icon: XmarkCircle,
        variant: "destructive",
    },
    cancelled: {
        icon: Prohibition,
        variant: "muted",
    },
};

export function StatusBadge({ status, processingStep }: StatusBadgeProps) {
    const config = statusConfig[status];
    const Icon = config.icon;
    const label = getProcessingStepText(status, processingStep ?? null);

    return (
        <Badge variant={config.variant} className="gap-1 font-medium">
            <Icon className={cn("h-3 w-3", config.animate && "animate-spin")} />
            {label}
        </Badge>
    );
}
