"use client";

import { WarningCircle, RefreshDouble } from "iconoir-react";
import { Button } from "@/components/ui/Button";
import { ViewerHeader } from "../layout/ViewerHeader";
import { getProcessingStepText } from "@/features/transcription/utils";
import type { TranscriptionData } from "@/features/transcription/types";

interface ViewerStatusProps {
    data: TranscriptionData;
    onToggleSidebar: () => void;
    onBack: () => void;
}

export function ViewerStatus({ data, onToggleSidebar, onBack }: ViewerStatusProps) {
    const { status, processingStep } = data;

    // Failed state
    if (status === "failed") {
        return (
            <div className="flex flex-col h-screen bg-background">
                <ViewerHeader data={data} onToggleSidebar={onToggleSidebar} />
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <WarningCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-foreground mb-1">Transcription failed</p>
                        <p className="text-sm text-muted-foreground">An error occurred during transcription.</p>
                    </div>
                    <Button variant="ghost" onClick={onBack}>Back to Dashboard</Button>
                </div>
            </div>
        );
    }

    // Pending/Processing state
    if (status === "pending" || status === "processing") {
        const stepText = getProcessingStepText(status, processingStep);
        return (
            <div className="flex flex-col h-screen bg-background">
                <ViewerHeader data={data} onToggleSidebar={onToggleSidebar} />
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                    <RefreshDouble className="h-10 w-10 text-primary animate-spin" />
                    <div className="text-center">
                        <p className="font-semibold text-foreground mb-1">{stepText}</p>
                        <p className="text-sm text-muted-foreground">This may take a few minutes depending on the file length.</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
