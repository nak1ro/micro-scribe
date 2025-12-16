"use client";

import * as React from "react";
import { FileAudio, Clock, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TranscriptionListItem } from "@/types/models/transcription";

interface StatsCardsProps {
    items: TranscriptionListItem[];
    isLoading?: boolean;
}

export function StatsCards({ items, isLoading }: StatsCardsProps) {
    const stats = React.useMemo(() => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const totalCount = items.length;
        const thisWeek = items.filter((item) => new Date(item.uploadDate) >= weekAgo).length;
        const totalDuration = items.reduce((sum, item) => sum + (item.duration ?? 0), 0);
        const processing = items.filter((item) => item.status === "processing" || item.status === "pending").length;

        return { totalCount, thisWeek, totalDuration, processing };
    }, [items]);

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 rounded-xl bg-card border border-border animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
                icon={FileAudio}
                value={stats.totalCount}
                label="Total Transcriptions"
                color="primary"
            />
            <StatCard
                icon={Calendar}
                value={stats.thisWeek}
                label="This Week"
                color="success"
            />
            <StatCard
                icon={Clock}
                value={formatDuration(stats.totalDuration)}
                label="Total Duration"
                color="info"
            />
            {stats.processing > 0 && (
                <StatCard
                    icon={Loader2}
                    value={stats.processing}
                    label="Processing"
                    color="warning"
                    iconSpin
                />
            )}
        </div>
    );
}

interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    value: string | number;
    label: string;
    color: "primary" | "success" | "info" | "warning";
    iconSpin?: boolean;
}

function StatCard({ icon: Icon, value, label, color, iconSpin }: StatCardProps) {
    const colorClasses = {
        primary: "text-primary bg-primary/10",
        success: "text-success bg-success/10",
        info: "text-info bg-info/10",
        warning: "text-warning bg-warning/10",
    };

    return (
        <div
            className={cn(
                "relative p-4 rounded-xl overflow-hidden",
                "bg-card border border-border",
                "shadow-sm hover:shadow-lg hover:translate-y-[-2px]",
                "transition-all duration-200"
            )}
        >
            {/* Icon in top-left */}
            <div className={cn("absolute top-3 right-3 p-2 rounded-lg opacity-80", colorClasses[color])}>
                <Icon className={cn("h-5 w-5", iconSpin && "animate-spin")} />
            </div>

            {/* Content */}
            <div className="pt-1">
                <div className="text-3xl font-bold text-foreground tracking-tight">{value}</div>
                <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
        </div>
    );
}
