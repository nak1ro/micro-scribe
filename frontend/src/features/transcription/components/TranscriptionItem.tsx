"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Trash2,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock4,
    Ban,
    Download,
    Share2,
    MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui";
import type { TranscriptionListItem, TranscriptionStatus } from "@/types/models/transcription";

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

// Status Badge
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
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
            className
        )}>
            <Icon className={cn("h-3 w-3", isAnimated && "animate-spin")} />
            {label}
        </span>
    );
}

// Action Menu Dropdown
interface ActionMenuProps {
    item: TranscriptionListItem;
    onDownload?: (id: string) => void;
    onShare?: (id: string) => void;
    onDelete?: (id: string) => void;
}

function ActionMenu({ item, onDownload, onShare, onDelete }: ActionMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Close on outside click
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    const hasActions = (item.status === "completed" && (onDownload || onShare)) || onDelete;
    if (!hasActions) return null;

    return (
        <div ref={menuRef} className="relative">
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "h-7 w-7",
                    "opacity-0 group-hover:opacity-100 transition-opacity",
                    "hover:bg-accent",
                    isOpen && "opacity-100 bg-accent"
                )}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                title="Actions"
            >
                <MoreHorizontal className="h-4 w-4" />
            </Button>

            {isOpen && (
                <div className={cn(
                    "absolute right-0 top-full mt-1 z-50",
                    "min-w-[140px] bg-card border border-border rounded-lg shadow-lg",
                    "py-1"
                )}>
                    {item.status === "completed" && onDownload && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownload(item.id);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Download
                        </button>
                    )}
                    {item.status === "completed" && onShare && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onShare(item.id);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                        >
                            <Share2 className="h-4 w-4" />
                            Share
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item.id);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// Helper
function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins >= 60) {
        const hrs = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return `${hrs}h ${remainingMins}m`;
    }
    return `${mins}m ${secs}s`;
}
