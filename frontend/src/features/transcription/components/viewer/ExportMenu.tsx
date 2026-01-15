"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NavArrowDown, Lock } from "iconoir-react";
import { getLanguageName } from "@/lib/utils";
import { useExportMenu } from "@/features/transcription/hooks/useExportMenu";

import type { ExportFormat } from "@/features/transcription/types";
import { EXPORT_FORMAT_OPTIONS } from "@/features/transcription/constants";

interface ExportMenuProps {
    onExport: (format: ExportFormat) => void;
    displayLanguage: string | null;
    sourceLanguage: string;
    disabled?: boolean;
    className?: string;
}



const triggerButtonClasses = cn(
    "w-full flex items-center justify-between gap-2",
    "px-3 py-2.5 rounded-lg",
    "bg-muted/50 hover:bg-muted",
    "border border-border hover:border-primary/30",
    "text-sm font-medium text-foreground",
    "transition-colors duration-150",
    "disabled:opacity-50 disabled:cursor-not-allowed"
);

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
        <div ref={menuRef} className={cn("relative", className)}>
            {/* Trigger button */}
            <button
                onClick={toggleOpen}
                disabled={disabled}
                className={triggerButtonClasses}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-controls={isOpen ? menuId : undefined}
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
