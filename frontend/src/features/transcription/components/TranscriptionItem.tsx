"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Pencil, Trash2, FileAudio, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui";
import type { TranscriptionListItem, TranscriptionStatus } from "../types";

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

    const formattedDuration = item.duration
        ? formatDuration(item.duration)
        : "—";

    return (
        <div
            className={cn(
                "group flex items-center gap-4 px-4 py-3",
                "border-b border-border last:border-b-0",
                "hover:bg-accent/50 transition-colors"
            )}
        >
            {/* Icon */}
            <div className="shrink-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileAudio className="h-5 w-5 text-primary" />
                </div>
            </div>

            {/* Name & Status */}
            <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                    {item.fileName}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{formattedDate}</span>
                    <StatusBadge status={item.status} />
                </div>
            </div>

            {/* Duration */}
            <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formattedDuration}</span>
            </div>

            {/* Language */}
            <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground min-w-[60px]">
                <Globe className="h-4 w-4" />
                <span>{item.language?.toUpperCase() || "—"}</span>
            </div>

            {/* Actions Menu */}
            <div className="relative" ref={menuRef}>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setMenuOpen(!menuOpen)}
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
// Status Badge
// ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TranscriptionStatus }) {
    const config: Record<TranscriptionStatus, { label: string; className: string }> = {
        pending: {
            label: "Pending",
            className: "bg-muted text-muted-foreground",
        },
        processing: {
            label: "Processing",
            className: "bg-info/10 text-info",
        },
        completed: {
            label: "Completed",
            className: "bg-success/10 text-success",
        },
        failed: {
            label: "Failed",
            className: "bg-destructive/10 text-destructive",
        },
        cancelled: {
            label: "Cancelled",
            className: "bg-muted text-muted-foreground",
        },
    };

    const { label, className } = config[status];

    return (
        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", className)}>
            {label}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
