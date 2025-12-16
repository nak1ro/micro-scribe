"use client";

import * as React from "react";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {
    Trash2,
    FileAudio,
    Globe,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock4,
    Ban,
    Download,
    Share2,
} from "lucide-react";
import {Button} from "@/components/ui";
import type {TranscriptionListItem, TranscriptionStatus} from "@/types/models/transcription";

interface TranscriptionItemProps {
    item: TranscriptionListItem;
    index?: number;
    onDownload?: (id: string) => void;
    onDelete?: (id: string) => void;
    onShare?: (id: string) => void;
}

export function TranscriptionItem({item, index = 0, onDownload, onDelete, onShare}: TranscriptionItemProps) {
    const router = useRouter();


    const formattedDate = new Date(item.uploadDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const handleItemClick = () => {
        router.push(`/transcriptions/${item.id}`);
    };

    const isEven = index % 2 === 0;

    return (
        <div
            onClick={handleItemClick}
            className={cn(
                "group flex items-center gap-4 px-4 py-4",
                "border-b border-border last:border-b-0",
                "hover:bg-accent/50 transition-colors cursor-pointer",
                isEven ? "bg-card" : "bg-muted/30"
            )}
        >
            {/* Icon with Status Indicator */}
            <div className="relative shrink-0">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    item.status === "completed" ? "bg-success/10" :
                        item.status === "failed" ? "bg-destructive/10" :
                            item.status === "processing" ? "bg-info/10" :
                                "bg-primary/10"
                )}>
                    <FileAudio className={cn(
                        "h-6 w-6",
                        item.status === "completed" ? "text-success" :
                            item.status === "failed" ? "text-destructive" :
                                item.status === "processing" ? "text-info" :
                                    "text-primary"
                    )}/>
                </div>
            </div>

            {/* Name & Metadata */}
            <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate text-base">
                    {item.fileName}
                </p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span>{formattedDate}</span>

                    {item.duration && (
                        <>
                            <span className="text-border">•</span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5"/>
                                {formatDuration(item.duration)}
                            </span>
                        </>
                    )}

                    {item.language && (
                        <>
                            <span className="text-border">•</span>
                            <span className="flex items-center gap-1">
                                <Globe className="h-3.5 w-3.5"/>
                                {item.language.toUpperCase()}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Right Section: Status Badge + Sliding Action Buttons */}
            <div className="flex items-center">
                {/* Sliding Actions Container */}
                <div className="overflow-hidden">
                    <div className={cn(
                        "flex items-center gap-1 pl-2",
                        "translate-x-full group-hover:translate-x-0",
                        "transition-transform duration-200 ease-out"
                    )}>
                        {item.status === "completed" && onDownload && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDownload(item.id);
                                }}
                                title="Download"
                            >
                                <Download className="h-4 w-4"/>
                            </Button>
                        )}
                        {item.status === "completed" && onShare && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onShare(item.id);
                                }}
                                title="Share"
                            >
                                <Share2 className="h-4 w-4"/>
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(item.id);
                                }}
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status Badge - Always visible */}
                <div className="ms-4 hidden sm:block">
                    <StatusBadge status={item.status}/>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Status Badge with Icon
// ─────────────────────────────────────────────────────────────

function StatusBadge({status}: { status: TranscriptionStatus }) {
    const config: Record<TranscriptionStatus, {
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        className: string;
    }> = {
        uploading: {
            label: "Uploading",
            icon: Loader2,
            className: "bg-primary/10 text-primary",
        },
        pending: {
            label: "Pending",
            icon: Clock4,
            className: "bg-muted text-muted-foreground",
        },
        processing: {
            label: "Processing",
            icon: Loader2,
            className: "bg-info/10 text-info",
        },
        completed: {
            label: "Completed",
            icon: CheckCircle2,
            className: "bg-success/10 text-success",
        },
        failed: {
            label: "Failed",
            icon: XCircle,
            className: "bg-destructive/10 text-destructive",
        },
        cancelled: {
            label: "Cancelled",
            icon: Ban,
            className: "bg-muted text-muted-foreground",
        },
    };

    const {label, icon: Icon, className} = config[status];
    const isAnimated = status === "processing" || status === "uploading";

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            className
        )}>
            <Icon className={cn("h-3.5 w-3.5", isAnimated && "animate-spin")}/>
            {label}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins >= 60) {
        const hrs = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return `${hrs}h ${remainingMins}m`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}
