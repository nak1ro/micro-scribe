"use client";

import * as React from "react";
import { Download, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui";

interface BulkActionBarProps {
    selectedCount: number;
    onClear: () => void;
    onDelete?: () => void;
    onDownload?: () => void;
}

export function BulkActionBar({ selectedCount, onClear, onDelete, onDownload }: BulkActionBarProps) {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-4 bg-card border border-border rounded-xl px-6 py-3 shadow-lg">
                <span className="text-sm font-medium text-foreground">
                    {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
                </span>

                <div className="flex items-center gap-2">
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

                    {onDelete && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={onDelete}
                            className="gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClear}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
