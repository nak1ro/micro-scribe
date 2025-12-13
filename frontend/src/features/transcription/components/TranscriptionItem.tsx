"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Pencil, Trash2, FileAudio, Globe } from "lucide-react";
import { Button } from "@/components/ui";
import type { TranscriptionListItem, TranscriptionStatus } from "@/types/models/transcription";

interface TranscriptionItemProps {
    item: TranscriptionListItem;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export function TranscriptionItem({ item, onEdit, onDelete }: TranscriptionItemProps) {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Close menu on outside click
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const formattedDate = new Date(item.uploadDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div
            className={cn(
                "group flex items-center gap-3 px-4 py-3",
                "border-b border-border last:border-b-0",
                "hover:bg-accent/50 transition-colors cursor-pointer"
            )}
        >
            {/* Icon with Status Dot */}
            <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileAudio className="h-5 w-5 text-primary" />
                </div>
                {/* Status Dot */}
                <StatusDot status={item.status} />
            </div>

            {/* Name & Metadata */}
            <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                    {item.fileName}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{formattedDate}</span>
                    {item.language && (
                        <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {item.language.toUpperCase()}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Status Text (on larger screens) */}
            <div className="hidden sm:block">
                <StatusLabel status={item.status} />
            </div>

            {/* Actions Menu */}
            <div className="relative" ref={menuRef}>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(!menuOpen);
                    }}
                >
                    <MoreHorizontal className="h-4 w-4" />
                </Button>

                {menuOpen && (
                    <div
                        className={cn(
                            "absolute right-0 top-full mt-1 z-10",
                            "w-36 py-1 rounded-md",
                            "bg-popover border border-border shadow-lg",
                            "animate-fade-in"
                        )}
                    >
                        <button
                            type="button"
                            className={cn(
                                "flex items-center gap-2 w-full px-3 py-2 text-sm",
                                "text-foreground hover:bg-accent transition-colors"
                            )}
                            onClick={() => {
                                onEdit?.(item.id);
                                setMenuOpen(false);
                            }}
                        >
                            <Pencil className="h-4 w-4" />
                            Edit
                        </button>
                        <button
                            type="button"
                            className={cn(
                                "flex items-center gap-2 w-full px-3 py-2 text-sm",
                                "text-destructive hover:bg-destructive/10 transition-colors"
                            )}
                            onClick={() => {
                                onDelete?.(item.id);
                                setMenuOpen(false);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Status Dot - Colored indicator on the icon
// ─────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: TranscriptionStatus }) {
    const colors: Record<TranscriptionStatus, string> = {
        pending: "bg-muted-foreground",
        processing: "bg-info animate-pulse",
        completed: "bg-success",
        failed: "bg-destructive",
        cancelled: "bg-muted-foreground",
    };

    return (
        <span
            className={cn(
                "absolute -bottom-0.5 -right-0.5",
                "w-3 h-3 rounded-full border-2 border-card",
                colors[status]
            )}
            title={status.charAt(0).toUpperCase() + status.slice(1)}
        />
    );
}

// ─────────────────────────────────────────────────────────────
// Status Label - Text label shown on larger screens
// ─────────────────────────────────────────────────────────────

function StatusLabel({ status }: { status: TranscriptionStatus }) {
    const config: Record<TranscriptionStatus, { label: string; className: string }> = {
        pending: {
            label: "Pending",
            className: "text-muted-foreground",
        },
        processing: {
            label: "Processing...",
            className: "text-info",
        },
        completed: {
            label: "Completed",
            className: "text-success",
        },
        failed: {
            label: "Failed",
            className: "text-destructive",
        },
        cancelled: {
            label: "Cancelled",
            className: "text-muted-foreground",
        },
    };

    const { label, className } = config[status];

    return (
        <span className={cn("text-xs font-medium", className)}>
            {label}
        </span>
    );
}
