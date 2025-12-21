"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, Clock, Users, Pencil, Settings } from "lucide-react";
import { Button } from "@/components/ui";
import { ExportMenu } from "./ExportMenu";
import { TranslateMenu } from "./TranslateMenu";
import type { ExportFormat } from "./types";

interface ActionsSidebarProps {
    // Copy action
    onCopy: () => void;
    isCopied: boolean;
    canCopy: boolean;
    // Toggles
    showTimecodes: boolean;
    onToggleTimecodes: (show: boolean) => void;
    showSpeakers: boolean;
    onToggleSpeakers: (show: boolean) => void;
    hasSpeakers: boolean;
    // Export
    onExport: (format: ExportFormat) => void;
    // Edit
    onEdit?: () => void;
    // Status
    disabled?: boolean;
    className?: string;
}

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

function Toggle({ checked, onChange, disabled }: ToggleProps) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            disabled={disabled}
            className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer",
                "rounded-full border-2 border-transparent",
                "transition-colors duration-200 ease-in-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                checked ? "bg-primary" : "bg-muted",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            <span
                className={cn(
                    "pointer-events-none inline-block h-4 w-4",
                    "rounded-full bg-background shadow-sm",
                    "transform transition-transform duration-200 ease-in-out",
                    checked ? "translate-x-4" : "translate-x-0"
                )}
            />
        </button>
    );
}

export function ActionsSidebar({
    onCopy,
    isCopied,
    canCopy,
    showTimecodes,
    onToggleTimecodes,
    showSpeakers,
    onToggleSpeakers,
    hasSpeakers,
    onExport,
    onEdit,
    disabled,
    className,
}: ActionsSidebarProps) {
    return (
        <div className={cn("flex flex-col h-full p-4", className)}>
            {/* Actions section */}
            <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    Actions
                </h3>

                {/* Export */}
                <ExportMenu onExport={onExport} disabled={disabled} />

                {/* Translate */}
                <TranslateMenu disabled={disabled} />

                {/* Copy */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onCopy}
                    disabled={disabled || !canCopy}
                    className={cn(
                        "w-full justify-start gap-2",
                        isCopied && "text-success border-success/30"
                    )}
                >
                    {isCopied ? (
                        <>
                            <Check className="h-4 w-4" />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4" />
                            <span>Copy transcript</span>
                        </>
                    )}
                </Button>
            </div>

            {/* Divider */}
            <div className="h-px bg-border my-6" />

            {/* Settings section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Display
                    </h3>
                </div>

                {/* Timecodes toggle */}
                <div className="flex items-center justify-between gap-3 px-1">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">Timecodes</span>
                    </div>
                    <Toggle
                        checked={showTimecodes}
                        onChange={onToggleTimecodes}
                        disabled={disabled}
                    />
                </div>

                {/* Speakers toggle */}
                {hasSpeakers && (
                    <div className="flex items-center justify-between gap-3 px-1">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">Speakers</span>
                        </div>
                        <Toggle
                            checked={showSpeakers}
                            onChange={onToggleSpeakers}
                            disabled={disabled}
                        />
                    </div>
                )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Edit section */}
            <div className="pt-4 border-t border-border">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    disabled={disabled || !onEdit}
                    className="w-full justify-start gap-2"
                >
                    <Pencil className="h-4 w-4" />
                    <span>Edit transcript</span>
                </Button>
            </div>
        </div>
    );
}
