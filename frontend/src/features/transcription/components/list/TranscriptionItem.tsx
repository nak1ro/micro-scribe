"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/features/transcription/utils";
import { useDragFolderHint } from "@/features/transcription/hooks/useDragFolderHint";
import { StatusBadge } from "./StatusBadge";
import { ActionMenu } from "./ActionMenu";
import type { TranscriptionListItem } from "@/types/models/transcription";

interface TranscriptionItemProps {
    item: TranscriptionListItem;
    index?: number;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
    onDownload?: (id: string) => void;
    onDelete?: (id: string) => void;
    onShare?: (id: string) => void;
}

export function TranscriptionItem({
    item,
    index = 0,
    isSelected = false,
    onSelect,
    onDownload,
    onDelete,
    onShare
}: TranscriptionItemProps) {
    const router = useRouter();
    const { handleDragStart } = useDragFolderHint();

    const formattedDate = new Date(item.uploadDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

    const handleItemClick = () => {
        router.push(`/transcriptions/${item.id}`);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        onSelect?.(item.id);
    };

    const isEven = index % 2 === 0;

    return (
        <div
            draggable
            onDragStart={(e) => handleDragStart(e, item.id)}
            onClick={handleItemClick}
            className={cn(
                "group grid items-center gap-3 px-3 py-2.5",
                "border-b border-border/30 last:border-b-0",
                "transition-all duration-150 cursor-pointer",
                "grid-cols-[32px_1fr_140px_80px_90px_36px]",
                isEven ? "bg-transparent" : "bg-muted/20",
                "hover:bg-accent/50 hover:shadow-sm",
                isSelected && "bg-primary/10 border-l-2 border-l-primary"
            )}
        >
            {/* Checkbox */}
            <div className="flex items-center justify-center">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                    onClick={(e) => e.stopPropagation()}
                    className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    aria-label={`Select ${item.fileName}`}
                />
            </div>

            {/* Name + Preview */}
            <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                    {item.fileName}
                </p>
                {item.preview && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {item.preview}
                    </p>
                )}
            </div>

            {/* Uploaded */}
            <div className="text-xs text-muted-foreground">
                {formattedDate}
            </div>

            {/* Duration */}
            <div className="text-xs text-muted-foreground">
                {item.duration ? formatDuration(item.duration) : "—"}
            </div>

            {/* Status */}
            <div>
                <StatusBadge status={item.status} />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end">
                <ActionMenu
                    item={item}
                    onDownload={onDownload}
                    onShare={onShare}
                    onDelete={onDelete}
                />
            </div>
        </div>
    );
}


