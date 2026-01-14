"use client";

import * as React from "react";
import { Download, Trash, Xmark, ShareIos, FolderPlus, NavArrowDown } from "iconoir-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useFolders, FOLDER_COLORS, type FolderDto } from "@/features/folders";

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
    const [showFolderDropdown, setShowFolderDropdown] = React.useState(false);
    const { data: folders } = useFolders();
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowFolderDropdown(false);
            }
        };
        if (showFolderDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [showFolderDropdown]);

    const handleFolderSelect = (folder: FolderDto) => {
        onMoveToFolder?.(folder.id);
        setShowFolderDropdown(false);
    };

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
                        <div ref={dropdownRef} className="relative">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFolderDropdown(!showFolderDropdown)}
                                className="gap-2"
                            >
                                <FolderPlus className="h-4 w-4" />
                                Move to Folder
                                <NavArrowDown className="h-3 w-3" />
                            </Button>

                            {showFolderDropdown && (
                                <div
                                    className={cn(
                                        "absolute bottom-full mb-2 left-0",
                                        "min-w-[180px] bg-card border border-border rounded-lg shadow-lg",
                                        "py-1 max-h-48 overflow-y-auto"
                                    )}
                                    role="menu"
                                >
                                    {folders && folders.length > 0 ? (
                                        folders.map((folder) => {
                                            const colors = FOLDER_COLORS[folder.color];
                                            return (
                                                <button
                                                    key={folder.id}
                                                    onClick={() => handleFolderSelect(folder)}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
                                                    role="menuitem"
                                                >
                                                    <div
                                                        className="w-3 h-3 rounded-sm"
                                                        style={{ backgroundColor: colors.border }}
                                                    />
                                                    <span className="truncate">{folder.name}</span>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                            No folders yet
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
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
