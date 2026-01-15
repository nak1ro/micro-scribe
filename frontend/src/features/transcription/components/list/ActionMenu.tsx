"use client";

import { MoreHoriz, Download, ShareIos, Trash } from "iconoir-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useActionMenu } from "@/features/transcription/hooks/useActionMenu";
import type { TranscriptionListItem } from "@/types/models";

interface ActionMenuProps {
    item: TranscriptionListItem;
    onDownload?: (id: string) => void;
    onShare?: (id: string) => void;
    onDelete?: (id: string) => void;
}

const triggerClasses = (isOpen: boolean) =>
    cn("h-7 w-7 transition-opacity opacity-0 group-hover:opacity-100", isOpen && "opacity-100 bg-accent");

const menuClasses = cn(
    "absolute right-0 top-full mt-1 z-50",
    "min-w-[140px] bg-card border border-border rounded-lg shadow-lg py-1"
);

const menuItemClasses = "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors";
const deleteItemClasses = "w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors";

export function ActionMenu({ item, onDownload, onShare, onDelete }: ActionMenuProps) {
    const { isOpen, menuRef, toggle, handleAction } = useActionMenu();

    const isCompleted = item.status === "completed";
    const hasActions = (isCompleted && (onDownload || onShare)) || onDelete;

    if (!hasActions) return null;

    return (
        <div ref={menuRef} className="relative">
            <Button
                variant="ghost"
                size="icon"
                className={triggerClasses(isOpen)}
                onClick={toggle}
                title="Actions"
                aria-haspopup="menu"
                aria-expanded={isOpen}
            >
                <MoreHoriz className="h-4 w-4" />
            </Button>

            {isOpen && (
                <div className={menuClasses} role="menu">
                    {isCompleted && onDownload && (
                        <button onClick={handleAction(() => onDownload(item.id))} className={menuItemClasses} role="menuitem">
                            <Download className="h-4 w-4" />
                            Download
                        </button>
                    )}
                    {isCompleted && onShare && (
                        <button onClick={handleAction(() => onShare(item.id))} className={menuItemClasses} role="menuitem">
                            <ShareIos className="h-4 w-4" />
                            Share
                        </button>
                    )}
                    {onDelete && (
                        <button onClick={handleAction(() => onDelete(item.id))} className={deleteItemClasses} role="menuitem">
                            <Trash className="h-4 w-4" />
                            Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
