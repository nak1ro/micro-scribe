"use client";

import * as React from "react";
import { Download, Trash, Xmark, ShareIos } from "iconoir-react";
import { Button } from "@/components/ui/Button";
import { FolderSelectionMenu } from "./FolderSelectionMenu";

interface BulkActionBarProps {
    selectedCount: number;
    onClear: () => void;
    onDelete?: () => void;
    onDownload?: () => void;
    onShare?: () => void;
    onMoveToFolder?: (folderId: string) => void;
}

export function BulkActionBar({
    selectedCount,
    onClear,
    onDelete,
    onDownload,
    onShare,
    onMoveToFolder
}: BulkActionBarProps) {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-4 bg-card border border-border rounded-xl px-6 py-3 shadow-lg">
                <span className="text-sm font-medium text-foreground">
                    {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
                </span>

                <div className="h-4 w-px bg-border" />

                <div className="flex items-center gap-2">
                    {/* Move to Folder */}
                    {onMoveToFolder && (
                        <FolderSelectionMenu onSelect={onMoveToFolder} />
                    )}

                    {/* Download */}
                    {onDownload && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDownload}
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Download
                        </Button>
                    )}

                    {/* Share */}
                    {onShare && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onShare}
                            className="gap-2"
                        >
                            <ShareIos className="h-4 w-4" />
                            Share
                        </Button>
                    )}

                    {/* Delete */}
                    {onDelete && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={onDelete}
                            className="gap-2"
                        >
                            <Trash className="h-4 w-4" />
                            Delete
                        </Button>
                    )}

                    {/* Close */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClear}
                        className="h-8 w-8"
                        aria-label="Clear selection"
                    >
                        <Xmark className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
