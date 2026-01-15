"use client";

import { WarningCircle } from "iconoir-react";
import { Button } from "@/components/ui/Button";

interface ViewerErrorProps {
    error: Error;
    onBack: () => void;
}

export function ViewerError({ error, onBack }: ViewerErrorProps) {
    return (
        <div className="flex flex-col h-screen bg-background items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <WarningCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center">
                <p className="font-semibold text-foreground mb-1">Failed to load transcription</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
            <Button variant="ghost" onClick={onBack}>
                Back to Dashboard
            </Button>
        </div>
    );
}
