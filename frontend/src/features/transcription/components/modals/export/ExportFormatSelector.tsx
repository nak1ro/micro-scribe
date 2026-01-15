"use client";

import Link from "next/link";
import { Check, Lock, Page, TextBox, MediaVideo, Table2Columns, MusicDoubleNote, Code } from "iconoir-react";
import { cn } from "@/lib/utils";
import { EXPORT_FORMAT_OPTIONS } from "@/features/transcription/constants";
import type { ExportFormat } from "@/features/transcription/types";

interface ExportFormatSelectorProps {
    selectedFormat: ExportFormat | null;
    onSelect: (format: ExportFormat) => void;
    canExport: (format: ExportFormat) => boolean;
}

const iconMap = {
    Page,
    TextBox,
    MediaVideo,
    Table2Columns,
    MusicDoubleNote,
    Code
};

export function ExportFormatSelector({
    selectedFormat,
    onSelect,
    canExport,
}: ExportFormatSelectorProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Format</h3>
            <div className="grid gap-2">
                {EXPORT_FORMAT_OPTIONS.map((format) => {
                    const Icon = iconMap[format.icon as keyof typeof iconMap] || Page;
                    const isSelected = selectedFormat === format.id;
                    const isRestricted = !canExport(format.id);

                    return (
                        <button
                            key={format.id}
                            onClick={() => !isRestricted && onSelect(format.id)}
                            disabled={isRestricted}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg",
                                "border transition-all text-left",
                                isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border",
                                !isSelected && !isRestricted && "hover:border-primary/30 hover:bg-muted/50",
                                isRestricted && "opacity-50 cursor-not-allowed bg-muted border-transparent"
                            )}
                        >
                            <Icon className={cn(
                                "h-5 w-5 shrink-0",
                                isSelected ? "text-primary" : "text-muted-foreground"
                            )} />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                    {format.label}
                                    {isRestricted && <Lock className="h-3.5 w-3.5 ml-auto text-muted-foreground" />}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {isRestricted ? (
                                        <Link href="/pricing" className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                                            Upgrade to Pro
                                        </Link>
                                    ) : (
                                        format.description
                                    )}
                                </div>
                            </div>
                            {isSelected && (
                                <Check className="h-4 w-4 text-primary shrink-0" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
