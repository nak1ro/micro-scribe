"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NavArrowDown, Lock, Download } from "iconoir-react";
import { getLanguageName } from "@/lib/utils";
import { useExportMenu } from "../../hooks/useExportMenu";

import type { ExportFormat } from "@/features/transcription/types";
import { EXPORT_FORMAT_OPTIONS } from "@/features/transcription/constants";

interface ExportMenuProps {
    onExport: (format: ExportFormat) => void;
    displayLanguage: string | null;
    sourceLanguage: string;
    disabled?: boolean;
    className?: string;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function ExportMenu({ onExport, displayLanguage, sourceLanguage, disabled, className }: ExportMenuProps) {
    const {
        isOpen,
        setIsOpen,
        menuRef,
        menuId,
        handleExport,
        canExport,
        getIconComponent,
        toggleOpen
    } = useExportMenu({ onExport });

    return (
        <div ref={menuRef} className={cn("relative h-full", className)}>
            {/* Trigger Card */}
            <button
                onClick={toggleOpen}
                disabled={disabled}
                className={cn(
                    "w-full h-full flex flex-col items-start justify-between gap-4", // Increased gap
                    "p-5 rounded-2xl text-left", // Increased padding & radius
                    "bg-indigo-500/10 dark:bg-indigo-500/20 hover:bg-indigo-500/20", // Stronger tint
                    "border border-indigo-500/10 hover:border-indigo-500/20",
                    "transition-all duration-200 shadow-sm",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    isOpen && "ring-2 ring-indigo-500/20 border-indigo-500/30"
                )}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-controls={isOpen ? menuId : undefined}
            >
                <div className="flex items-center justify-between w-full">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 transition-colors">
                        <Download className="h-5 w-5" /> {/* Bigger icon */}
                    </div>
                </div>

                <div className="flex flex-col gap-1 w-full">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"> {/* Bigger text */}
                        Action
                    </span>
                    <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-base font-semibold truncate leading-tight"> {/* Bigger text */}
                            Export
                        </span>
                        <NavArrowDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200 opacity-50", isOpen && "rotate-180 opacity-100")} />
                    </div>
                </div>
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
                    id={menuId}
                >
                    {/* Language hint */}
                    <div className="px-3 py-2 border-b border-border mb-1">
                        <span className="text-[11px] text-muted-foreground">
                            Exporting in {getLanguageName(displayLanguage || sourceLanguage)}
                        </span>
                    </div>
                    {EXPORT_FORMAT_OPTIONS.map((option) => {
                        const Icon = getIconComponent(option.icon);
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
