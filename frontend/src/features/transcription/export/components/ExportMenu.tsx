"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NavArrowDown, Page, TextBox, MediaVideo, Table2Columns, MusicDoubleNote, Lock } from "iconoir-react";
import { getLanguageName } from "@/lib/utils";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import type { ExportFormat, ExportOption } from "@/features/transcription/types";

interface ExportMenuProps {
    onExport: (format: ExportFormat) => void;
    displayLanguage: string | null;
    sourceLanguage: string;
    disabled?: boolean;
    className?: string;
}

const exportOptions: ExportOption[] = [
    {
        id: "txt",
        label: "Plain Text",
        description: "Simple text file",
        icon: "FileText",
    },
    {
        id: "docx",
        label: "Word Document",
        description: "Microsoft Word format",
        icon: "FileType",
    },
    {
        id: "srt",
        label: "SRT Subtitles",
        description: "Standard subtitle format",
        icon: "Subtitles",
    },
    {
        id: "csv",
        label: "CSV Spreadsheet",
        description: "Comma-separated values",
        icon: "Table",
    },
    {
        id: "mp3",
        label: "Audio (MP3)",
        description: "Download original audio",
        icon: "Music",
    },
];

const iconMap = {
    FileText: Page,
    FileType: TextBox,
    Subtitles: MediaVideo,
    Table: Table2Columns,
    Music: MusicDoubleNote,
};

export function ExportMenu({ onExport, displayLanguage, sourceLanguage, disabled, className }: ExportMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const { canExport, isPro } = usePlanLimits();

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Close on escape
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    const handleExport = (format: ExportFormat) => {
        if (!canExport(format)) return;
        onExport(format);
        setIsOpen(false);
    };

    return (
        <div ref={menuRef} className={cn("relative", className)}>
            {/* Trigger button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    "w-full flex items-center justify-between gap-2",
                    "px-3 py-2.5 rounded-lg",
                    "bg-muted/50 hover:bg-muted",
                    "border border-border hover:border-primary/30",
                    "text-sm font-medium text-foreground",
                    "transition-colors duration-150",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span>Export</span>
                <NavArrowDown
                    className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div
                    className={cn(
                        "absolute top-full left-0 right-0 mt-1 z-50",
                        "bg-popover border border-border rounded-lg shadow-lg",
                        "py-1 animate-fade-in"
                    )}
                    role="menu"
                >
                    {/* Language hint */}
                    <div className="px-3 py-2 border-b border-border mb-1">
                        <span className="text-[11px] text-muted-foreground">
                            Exporting in {getLanguageName(displayLanguage || sourceLanguage)}
                        </span>
                    </div>
                    {exportOptions.map((option) => {
                        const Icon = iconMap[option.icon as keyof typeof iconMap];
                        const isLocked = !canExport(option.id);

                        return (
                            <button
                                key={option.id}
                                onClick={() => handleExport(option.id)}
                                disabled={isLocked}
                                className={cn(
                                    "w-full flex items-start gap-3 px-3 py-2.5",
                                    "text-left transition-colors duration-100",
                                    isLocked
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-accent"
                                )}
                                role="menuitem"
                            >
                                <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-foreground flex items-center gap-2">
                                        {option.label}
                                        {isLocked && (
                                            <Lock className="h-3 w-3 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {isLocked ? (
                                            <Link href="/pricing" className="text-primary hover:underline">
                                                Upgrade to Pro
                                            </Link>
                                        ) : (
                                            option.description
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
