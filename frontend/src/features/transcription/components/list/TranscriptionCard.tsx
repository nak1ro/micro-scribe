"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MusicDoubleNote } from "iconoir-react";
import { cn } from "@/lib/utils";
import { getProcessingStepText, formatDuration } from "@/features/transcription/utils";
import { StatusBadge } from "./StatusBadge";
import { TranscriptionCardActions } from "./TranscriptionCardActions";
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

// Status categories
const IN_PROGRESS_STATUSES: TranscriptionStatus[] = ["uploading", "pending", "processing"];

export function TranscriptionCard({
    item,
    isSelected = false,
    onSelect,
    onDownload,
    onDelete,
    onCancelUpload,
    onCancelJob,
    // onShare unused in card view currently
}: TranscriptionCardProps) {
    const router = useRouter();
    const [isHovered, setIsHovered] = React.useState(false);

    const formattedDate = new Date(item.uploadDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });

    const isInProgress = IN_PROGRESS_STATUSES.includes(item.status);

    const handleCardClick = () => {
        if (isInProgress) return;
        router.push(`/transcriptions/${item.id}`);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        onSelect?.(item.id);
    };

    const handleCancel = (id: string) => {
        if (item.status === "uploading") {
            onCancelUpload?.(id);
        } else {
            onCancelJob?.(id);
        }
    };

    // Get processing step text for preview
    const processingText = getProcessingStepText(item.status, item.processingStep ?? null);

    return (
        <div
            onClick={handleCardClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "relative flex flex-col p-4 rounded-xl",
                "bg-card border border-border",
                "transition-all duration-200",
                !isInProgress && "cursor-pointer hover:border-primary/30 hover:shadow-lg",
                isInProgress && "cursor-default opacity-80 bg-muted/5",
                isSelected && "ring-2 ring-primary border-primary"
            )}
        >
            <TranscriptionCardActions
                item={item}
                isHovered={isHovered}
                isInProgress={isInProgress}
                onDownload={onDownload}
                onDelete={onDelete}
                onCancel={handleCancel}
            />

            {/* Header: Icon + Title */}
            <div className="flex items-center gap-3 mb-3 pr-10">
                <div
                    className="relative p-2 rounded-lg bg-primary/10 shrink-0 h-9 w-9 flex items-center justify-center cursor-pointer group/icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect?.(item.id);
                    }}
                >
                    <MusicDoubleNote
                        className={cn(
                            "h-5 w-5 text-primary transition-opacity duration-200",
                            (isSelected || isHovered) ? "opacity-0" : "opacity-100"
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
                            (isSelected || isHovered) ? "opacity-100" : "opacity-0 pointer-events-none"
                        )}
                        aria-label={`Select ${item.fileName}`}
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground truncate text-lg" title={item.fileName}>
                        {item.fileName}
                    </h3>
                </div>
            </div>

            {/* Preview Text */}
            <p className={cn(
                "text-sm mb-4 h-[72px] leading-6 overflow-hidden line-clamp-3",
                item.preview ? "text-muted-foreground" : "text-muted-foreground/50 italic"
            )}>
                {item.preview || (item.status === "completed" ? "No preview available" : processingText)}
            </p>

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



