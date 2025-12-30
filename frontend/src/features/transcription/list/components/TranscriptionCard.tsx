"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    MusicDoubleNote,
    Download,
    Trash,
    RefreshDouble,
    Clock,
    CheckCircle,
    XmarkCircle,
    Prohibition,
    Xmark,
} from "iconoir-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { getProcessingStepText } from "@/features/transcription/utils";
import type { TranscriptionListItem, TranscriptionStatus } from "@/types/models/transcription";

interface TranscriptionCardProps {
    item: TranscriptionListItem;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
    onDownload?: (id: string) => void;
    onDelete?: (id: string) => void;
    onCancelUpload?: (id: string) => void;
    onCancelJob?: (id: string) => void;
    onShare?: (id: string) => void;
}

// Status categories for button visibility
const IN_PROGRESS_STATUSES: TranscriptionStatus[] = ["uploading", "pending", "processing"];
const FINISHED_STATUSES: TranscriptionStatus[] = ["completed", "failed", "cancelled"];

export function TranscriptionCard({
    item,
    isSelected = false,
    onSelect,
    onDownload,
    onDelete,
    onCancelUpload,
    onCancelJob,
    onShare,
}: TranscriptionCardProps) {
    const router = useRouter();
    const [showActions, setShowActions] = React.useState(false);

    const formattedDate = new Date(item.uploadDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });

    const formatDuration = (seconds: number) => {
        const totalSeconds = Math.round(seconds);
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    const handleCardClick = () => {
        router.push(`/transcriptions/${item.id}`);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        onSelect?.(item.id);
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.status === "uploading") {
            onCancelUpload?.(item.id);
        } else {
            onCancelJob?.(item.id);
        }
    };

    // Get processing step text for preview
    const processingText = getProcessingStepText(item.status, item.processingStep ?? null);

    const isInProgress = IN_PROGRESS_STATUSES.includes(item.status);
    const isFinished = FINISHED_STATUSES.includes(item.status);

    return (
        <div
            onClick={handleCardClick}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
            className={cn(
                "relative flex flex-col p-4 rounded-xl cursor-pointer",
                "bg-card border border-border",
                "hover:border-primary/30 hover:shadow-lg",
                "transition-all duration-200",
                isSelected && "ring-2 ring-primary border-primary"
            )}
        >

            {/* Cancel button - always visible for in-progress */}
            {isInProgress && (onCancelUpload || onCancelJob) && (
                <div className="absolute top-3 right-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-card/80 backdrop-blur text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleCancel}
                        title="Cancel"
                        aria-label="Cancel transcription"
                    >
                        <Xmark className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )}

            {/* Action menu - only for finished items on hover */}
            {showActions && isFinished && (
                <div className="absolute top-3 right-3 flex gap-1">
                    {item.status === "completed" && onDownload && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 bg-card/80 backdrop-blur"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownload(item.id);
                            }}
                            title="Download"
                            aria-label="Download transcription"
                        >
                            <Download className="h-3.5 w-3.5" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 bg-card/80 backdrop-blur text-destructive hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item.id);
                            }}
                            title="Delete"
                            aria-label="Delete transcription"
                        >
                            <Trash className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            )}

            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-3 pr-16">
                <div className="relative p-2 rounded-lg bg-primary/10 shrink-0 h-9 w-9 flex items-center justify-center">
                    <MusicDoubleNote
                        className={cn(
                            "h-5 w-5 text-primary transition-opacity duration-200",
                            (isSelected || showActions) ? "opacity-0" : "opacity-100"
                        )}
                    />
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={handleCheckboxChange}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                            "h-5 w-5 rounded border-border text-primary",
                            "focus:ring-primary cursor-pointer",
                            "transition-opacity duration-200",
                            (isSelected || showActions) ? "opacity-100" : "opacity-0 pointer-events-none"
                        )}
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground truncate text-lg">
                        {item.fileName}
                    </h3>
                </div>
            </div>

            {/* Preview text */}
            {item.preview ? (
                <p className="text-sm text-muted-foreground overflow-hidden mb-4 h-[72px] leading-6" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {item.preview}
                </p>
            ) : (
                <p className="text-sm text-muted-foreground/50 italic mb-4 h-[72px]">
                    {item.status === "completed" ? "No preview available" : processingText}
                </p>
            )}

            {/* Footer: Status + Metadata */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                <StatusBadge status={item.status} processingStep={item.processingStep} />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {item.duration && (
                        <span>{formatDuration(item.duration)}</span>
                    )}
                    <span>•</span>
                    <span>{formattedDate}</span>
                </div>
            </div>
        </div>
    );
}

// Status Badge Component
interface StatusBadgeProps {
    status: TranscriptionStatus;
    processingStep?: string | null;
}

function StatusBadge({ status, processingStep }: StatusBadgeProps) {
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
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium",
            className
        )}>
            <Icon className={cn("h-3 w-3", isAnimated && "animate-spin")} />
            {label}
        </span>
    );
}

