"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, Youtube, Mic, FileAudio } from "lucide-react";

type InputType = "file" | "youtube" | "voice";

interface TranscriptionEmptyStateProps {
    onNewClick?: (type?: InputType) => void;
}

export function TranscriptionEmptyState({ onNewClick }: TranscriptionEmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center",
                "py-16 px-8 text-center",
                "border border-border rounded-xl",
                "bg-card"
            )}
        >
            {/* Illustration */}
            <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <FileAudio className="h-10 w-10 text-primary" />
                </div>
                {/* Decorative dots */}
                <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary/30" />
                <div className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-secondary/30" />
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-2">
                No transcriptions yet
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md">
                Get started by uploading your first audio or video file, pasting a YouTube link, or recording directly.
            </p>

            {/* 3-Option Cards */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
                <OptionCard
                    icon={Upload}
                    title="Upload File"
                    description="Audio or video"
                    onClick={() => onNewClick?.("file")}
                />
                <OptionCard
                    icon={Youtube}
                    title="YouTube Link"
                    description="From URL"
                    onClick={() => onNewClick?.("youtube")}
                />
                <OptionCard
                    icon={Mic}
                    title="Record Voice"
                    description="Use microphone"
                    onClick={() => onNewClick?.("voice")}
                />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Option Card
// ─────────────────────────────────────────────────────────────

interface OptionCardProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    onClick?: () => void;
}

function OptionCard({ icon: Icon, title, description, onClick }: OptionCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex-1 flex flex-col items-center gap-2 p-5",
                "bg-muted/30 hover:bg-muted/50",
                "border border-border hover:border-primary/30",
                "rounded-xl",
                "transition-all duration-200",
                "hover:shadow-md",
                "group"
            )}
        >
            <div
                className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    "bg-primary/10 group-hover:bg-primary/20",
                    "transition-colors"
                )}
            >
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
                <p className="font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </button>
    );
}
