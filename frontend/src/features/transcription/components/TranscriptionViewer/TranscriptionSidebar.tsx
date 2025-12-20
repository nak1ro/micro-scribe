"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
    FileText,
    FileType2,
    Subtitles,
    Table2,
    Video,
    Music,
    Globe,
    Copy,
    Check,
    Clock,
    Download,
    ChevronDown,
} from "lucide-react";

// Export format configuration
const EXPORT_FORMATS = [
    { id: "txt", label: "Plain Text", ext: ".txt", icon: FileText },
    { id: "docx", label: "Word Document", ext: ".docx", icon: FileType2 },
    { id: "srt", label: "SRT Subtitles", ext: ".srt", icon: Subtitles },
    { id: "csv", label: "CSV", ext: ".csv", icon: Table2 },
    { id: "video", label: "Video", ext: ".mp4", icon: Video },
    { id: "audio", label: "Audio", ext: ".mp3", icon: Music },
] as const;

interface TranscriptionSidebarProps {
    // Actions
    onCopyTranscript: () => void;
    isCopied: boolean;
    showTimecodes: boolean;
    onToggleTimecodes: (show: boolean) => void;
    onDownloadAudio: () => void;
    // Visibility
    hasTranscript: boolean;
    hasAudioUrl: boolean;
    hasSegments: boolean;
}

export function TranscriptionSidebar({
    onCopyTranscript,
    isCopied,
    showTimecodes,
    onToggleTimecodes,
    onDownloadAudio,
    hasTranscript,
    hasAudioUrl,
    hasSegments,
}: TranscriptionSidebarProps) {
    const handleExport = (formatId: string) => {
        // Placeholder - show coming soon toast or notification
        console.log(`Export as ${formatId} - coming soon`);
    };

    const handleTranslate = () => {
        // Placeholder
        console.log("Translate - coming soon");
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Actions</h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-8">
                {/* Quick Actions Section - Most important, so first */}
                <SidebarSection title="Quick Actions">
                    <div className="space-y-1.5">
                        {/* Copy Transcript */}
                        {hasTranscript && (
                            <ActionButton
                                icon={isCopied ? Check : Copy}
                                label={isCopied ? "Copied!" : "Copy Transcript"}
                                onClick={onCopyTranscript}
                                variant={isCopied ? "success" : "default"}
                            />
                        )}

                        {/* Show Timestamps Toggle */}
                        {hasSegments && (
                            <ActionButton
                                icon={Clock}
                                label="Show Timestamps"
                                onClick={() => onToggleTimecodes(!showTimecodes)}
                                isActive={showTimecodes}
                                showToggle
                            />
                        )}

                        {/* Download Audio */}
                        {hasAudioUrl && (
                            <ActionButton
                                icon={Download}
                                label="Download Audio"
                                onClick={onDownloadAudio}
                            />
                        )}
                    </div>
                </SidebarSection>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Export Section */}
                <SidebarSection title="Export" icon={FileText}>
                    <div className="space-y-0.5">
                        {EXPORT_FORMATS.map((format) => (
                            <ExportFormatButton
                                key={format.id}
                                label={format.label}
                                extension={format.ext}
                                icon={format.icon}
                                onClick={() => handleExport(format.id)}
                                disabled={!hasTranscript}
                            />
                        ))}
                    </div>
                    <ComingSoonBadge />
                </SidebarSection>

                {/* Translate Section */}
                <SidebarSection title="Translate" icon={Globe}>
                    <button
                        onClick={handleTranslate}
                        disabled={!hasTranscript}
                        className={cn(
                            "flex items-center justify-between w-full",
                            "px-3 py-2.5 rounded-lg",
                            "text-sm text-left",
                            "bg-muted/50 border border-border",
                            "hover:bg-accent hover:border-primary/20",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            "transition-colors duration-150"
                        )}
                    >
                        <span className="text-muted-foreground">Select language...</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <ComingSoonBadge />
                </SidebarSection>
            </div>
        </div>
    );
}

// Section wrapper component
interface SidebarSectionProps {
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
}

function SidebarSection({ title, icon: Icon, children }: SidebarSectionProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 text-primary" />}
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {title}
                </span>
            </div>
            {children}
        </div>
    );
}

// Export format button
interface ExportFormatButtonProps {
    label: string;
    extension: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    disabled?: boolean;
}

function ExportFormatButton({
    label,
    extension,
    icon: Icon,
    onClick,
    disabled,
}: ExportFormatButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex items-center gap-3 w-full",
                "px-3 py-2.5 rounded-lg",
                "text-sm text-foreground",
                "hover:bg-accent",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                "transition-colors duration-150",
                "group"
            )}
        >
            <div className="w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="flex-1 text-left font-medium">{label}</span>
            <span className="text-xs text-muted-foreground/70 font-mono">{extension}</span>
        </button>
    );
}

// Action button component
interface ActionButtonProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick: () => void;
    variant?: "default" | "success";
    isActive?: boolean;
    showToggle?: boolean;
}

function ActionButton({
    icon: Icon,
    label,
    onClick,
    variant = "default",
    isActive = false,
    showToggle = false,
}: ActionButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 w-full",
                "px-3 py-2.5 rounded-lg",
                "text-sm font-medium",
                "transition-all duration-150",
                variant === "success" && "text-success bg-success/10",
                variant === "default" && !isActive && "text-foreground hover:bg-accent",
                isActive && "bg-primary/10 text-primary"
            )}
        >
            <div className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors",
                variant === "success" && "bg-success/20",
                variant === "default" && !isActive && "bg-muted/50",
                isActive && "bg-primary/20"
            )}>
                <Icon className={cn(
                    "h-4 w-4",
                    variant === "success" && "text-success",
                    variant === "default" && !isActive && "text-muted-foreground",
                    isActive && "text-primary"
                )} />
            </div>
            <span className="flex-1 text-left">{label}</span>
            {showToggle && (
                <div className={cn(
                    "w-9 h-5 rounded-full transition-colors relative",
                    isActive ? "bg-primary" : "bg-muted"
                )}>
                    <div className={cn(
                        "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                        isActive ? "translate-x-4" : "translate-x-0.5"
                    )} />
                </div>
            )}
        </button>
    );
}

// Coming soon badge
function ComingSoonBadge() {
    return (
        <div className="flex items-center justify-center mt-2">
            <span className={cn(
                "px-2 py-0.5 rounded-full",
                "text-xs font-medium",
                "bg-muted text-muted-foreground"
            )}>
                Coming Soon
            </span>
        </div>
    );
}

export const SIDEBAR_WIDTH = 240;
