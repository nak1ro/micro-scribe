"use client";

import type * as React from "react";
import { toast } from "sonner";

export function useDragFolderHint() {
    const handleDragStart = (e: React.DragEvent, itemId: string) => {
        e.dataTransfer.setData("application/x-scribe-job-id", itemId);
        e.dataTransfer.effectAllowed = "move";

        // Show hint toast only once
        const hasShownHint = localStorage.getItem("scribe-drag-folder-hint");
        if (!hasShownHint) {
            toast("Drag to a folder to move", {
                duration: 3000,
                position: "bottom-center"
            });
            localStorage.setItem("scribe-drag-folder-hint", "true");
        }
    };

    return { handleDragStart };
}
