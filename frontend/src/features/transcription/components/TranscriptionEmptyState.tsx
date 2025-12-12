"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FileAudio, Plus } from "lucide-react";
import { Button } from "@/components/ui";

interface TranscriptionEmptyStateProps {
    onNewClick?: () => void;
}

export function TranscriptionEmptyState({ onNewClick }: TranscriptionEmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center",
                "py-16 px-8 text-center",
                "border-2 border-dashed border-border rounded-xl",
                "bg-muted/30"
            )}
        >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileAudio className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
                No transcriptions yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
                Upload your first audio or video file to get started with AI-powered transcription.
            </p>
            <Button onClick={onNewClick} className="gap-2">
                <Plus className="h-4 w-4" />
                <span>New Transcription</span>
            </Button>
        </div>
    );
}
