"use client";

import * as React from "react";
import { Download, Trash, Xmark } from "iconoir-react";
import { Button } from "@/components/ui/Button";
import type { TranscriptionListItem } from "@/types/models/transcription";

interface TranscriptionCardActionsProps {
    item: TranscriptionListItem;
    isHovered: boolean;
    isInProgress: boolean;
    onDownload?: (id: string) => void;
    onDelete?: (id: string) => void;
    onCancel: (id: string) => void;
}

export function TranscriptionCardActions({
    item,
    isHovered,
    isInProgress,
    onDownload,
    onDelete,
    onCancel
}: TranscriptionCardActionsProps) {
    if (isInProgress) {
        return (
            <div className="absolute top-3 right-3 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 bg-card/80 backdrop-blur text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                        e.stopPropagation();
                        onCancel(item.id);
                    }}
                    title="Cancel"
                    aria-label="Cancel transcription"
                >
                    <Xmark className="h-3.5 w-3.5" />
                </Button>
            </div>
        );
    }

    if (isHovered && item.status === "completed") {
        return (
            <div className="absolute top-3 right-3 flex gap-1 z-10">
                {onDownload && (
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
        );
    }

    if (isHovered && (item.status === "failed" || item.status === "cancelled")) {
        return (
            <div className="absolute top-3 right-3 flex gap-1 z-10">
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
        );
    }

    return null;
}
