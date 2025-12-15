"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    FileAudio,
    Globe,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock4,
    Ban,
} from "lucide-react";
import { Button } from "@/components/ui";
import type { TranscriptionListItem, TranscriptionStatus } from "@/types/models/transcription";

interface TranscriptionItemProps {
    item: TranscriptionListItem;
    index?: number;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export function TranscriptionItem({ item, index = 0, onEdit, onDelete }: TranscriptionItemProps) {
    const router = useRouter();
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

    const handleItemClick = () => {
        router.push(`/transcriptions/${item.id}`);
    };

    const isEven = index % 2 === 0;

    return (
        <div
            onClick={handleItemClick}
            className={cn(
                "group flex items-center gap-4 px-4 py-4",
                "border-b border-border last:border-b-0",
                "hover:bg-accent/50 transition-colors cursor-pointer",
                isEven ? "bg-card" : "bg-muted/30"
            )}
        >
            {/* Icon with Status Indicator */}
            <div className="relative shrink-0">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    item.status === "completed" ? "bg-success/10" :
                        item.status === "failed" ? "bg-destructive/10" :
                            item.status === "processing" ? "bg-info/10" :
                                "bg-primary/10"
                )}>
                    <FileAudio className={cn(
                        "h-6 w-6",
                        item.status === "completed" ? "text-success" :
                            item.status === "failed" ? "text-destructive" :
                                item.status === "processing" ? "text-info" :
                                    "text-primary"
                    )} />
                </div>
            </div>

            {/* Name & Metadata */}
            <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate text-base">
                    {item.fileName}
                </p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span>{formattedDate}</span>

                    {item.duration && (
                        <>
                            <span className="text-border">•</span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {formatDuration(item.duration)}
                            </span>
                        </>
                    )}

                    {item.language && (
                        <>
                            <span className="text-border">•</span>
                            <span className="flex items-center gap-1">
                                <Globe className="h-3.5 w-3.5" />
                                {item.language.toUpperCase()}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Status Badge with Icon */}
            <div className="hidden sm:block">
                <StatusBadge status={item.status} />
            </div>

            {/* Actions Menu */}
            <div className="relative" ref={menuRef}>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(!menuOpen);
                    }}
                >
                    <MoreHorizontal className="h-5 w-5" />
                </Button>

                {menuOpen && (
                    <div
                        className={cn(
                            "absolute right-0 top-full mt-1 z-10",
                            "w-40 py-1 rounded-lg",
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
// Status Badge with Icon
// ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TranscriptionStatus }) {
    const config: Record<TranscriptionStatus, {
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        className: string;
    }> = {
        uploading: {
            label: "Uploading",
            icon: Loader2,
            className: "bg-primary/10 text-primary",
        },
        pending: {
            label: "Pending",
            icon: Clock4,
            className: "bg-muted text-muted-foreground",
        },
        processing: {
            label: "Processing",
            icon: Loader2,
            className: "bg-info/10 text-info",
        },
        completed: {
            label: "Completed",
            icon: CheckCircle2,
            className: "bg-success/10 text-success",
        },
        failed: {
            label: "Failed",
            icon: XCircle,
            className: "bg-destructive/10 text-destructive",
        },
        cancelled: {
            label: "Cancelled",
            icon: Ban,
            className: "bg-muted text-muted-foreground",
        },
    };

    const { label, icon: Icon, className } = config[status];
    const isAnimated = status === "processing" || status === "uploading";

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            className
        )}>
            <Icon className={cn("h-3.5 w-3.5", isAnimated && "animate-spin")} />
            {label}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins >= 60) {
        const hrs = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return `${hrs}h ${remainingMins}m`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}
