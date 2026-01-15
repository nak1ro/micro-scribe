"use client";

import * as React from "react";
import { FolderPlus, NavArrowDown } from "iconoir-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useOnClickOutside } from "@/hooks";
import { useFolders, FOLDER_COLORS, type FolderDto } from "@/features/folders";

interface FolderSelectionMenuProps {
    onSelect: (folderId: string) => void;
}

export function FolderSelectionMenu({ onSelect }: FolderSelectionMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const { data: folders } = useFolders();
    const menuRef = React.useRef<HTMLDivElement>(null);

    useOnClickOutside(menuRef, () => setIsOpen(false));

    const handleSelect = (folder: FolderDto) => {
        onSelect(folder.id);
        setIsOpen(false);
    };

    return (
        <div ref={menuRef} className="relative">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="gap-2"
                aria-haspopup="menu"
                aria-expanded={isOpen}
            >
                <FolderPlus className="h-4 w-4" />
                Move to Folder
                <NavArrowDown className="h-3 w-3" />
            </Button>

            {isOpen && (
                <div
                    className={cn(
                        "absolute bottom-full mb-2 left-0",
                        "min-w-[180px] bg-card border border-border rounded-lg shadow-lg",
                        "py-1 max-h-48 overflow-y-auto z-50" // Added z-50
                    )}
                    role="menu"
                >
                    {folders && folders.length > 0 ? (
                        folders.map((folder) => {
                            const colors = FOLDER_COLORS[folder.color];
                            return (
                                <button
                                    key={folder.id}
                                    onClick={() => handleSelect(folder)}
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
    );
}
