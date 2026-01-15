"use client";

import { cn } from "@/lib/utils";
import { getProcessingStepText, formatDuration } from "@/features/transcription/utils";
import { useTranscriptionCard } from "@/features/transcription/dashboard/hooks/useTranscriptionCard";
import { StatusBadge } from "./StatusBadge";
import { TranscriptionCardActions } from "../actions/TranscriptionCardActions";
import { CardHeader } from "./CardHeader";
import type { TranscriptionListItem } from "@/types/models/transcription";

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

const cardClasses = (isInProgress: boolean, isSelected: boolean) =>
    cn(
        "relative flex flex-col p-4 rounded-xl bg-card border border-border transition-all duration-200",
        !isInProgress && "cursor-pointer hover:border-primary/30 hover:shadow-lg",
        isInProgress && "cursor-default opacity-80 bg-muted/5",
        isSelected && "ring-2 ring-primary border-primary"
    );

export function TranscriptionCard({
    item,
    isSelected = false,
    onSelect,
    onDownload,
    onDelete,
    onCancelUpload,
    onCancelJob,
}: TranscriptionCardProps) {
    const { isHovered, setIsHovered, isInProgress, formattedDate, handleCardClick, handleSelect, handleCancel } =
        useTranscriptionCard({ item, onSelect, onCancelUpload, onCancelJob });

    const processingText = getProcessingStepText(item.status, item.processingStep ?? null);

    return (
        <div
            onClick={handleCardClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cardClasses(isInProgress, isSelected)}
        >
            <TranscriptionCardActions
                item={item}
                isHovered={isHovered}
                isInProgress={isInProgress}
                onDownload={onDownload}
                onDelete={onDelete}
                onCancel={handleCancel}
            />

            <CardHeader fileName={item.fileName} isSelected={isSelected} isHovered={isHovered} onSelect={handleSelect} />

            {/* Preview Text */}
            <p className={cn("text-sm mb-4 h-[72px] leading-6 overflow-hidden line-clamp-3", item.preview ? "text-muted-foreground" : "text-muted-foreground/50 italic")}>
                {item.preview || (item.status === "completed" ? "No preview available" : processingText)}
            </p>

            {/* Footer: Status + Metadata */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                <StatusBadge status={item.status} processingStep={item.processingStep} />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {item.duration && <span>{formatDuration(item.duration)}</span>}
                    <span>•</span>
                    <span>{formattedDate}</span>
                </div>
            </div>
        </div>
    );
}
