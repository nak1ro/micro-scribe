// Utility functions for Transcription feature

// Get status display info
export function getStatusInfo(status: string): { label: string; color: string } {
    const statusMap: Record<string, { label: string; color: string }> = {
        pending: { label: "Pending", color: "text-warning" },
        processing: { label: "Processing", color: "text-info" },
        completed: { label: "Completed", color: "text-success" },
        failed: { label: "Failed", color: "text-destructive" },
    };
    return statusMap[status.toLowerCase()] || { label: status, color: "text-muted-foreground" };
}

// Check if speaker changed from previous segment
export function hasSpeakerChanged(
    currentSpeaker: string | null,
    previousSpeaker: string | null
): boolean {
    if (!currentSpeaker || !previousSpeaker) return false;
    return currentSpeaker !== previousSpeaker;
}

// Get user-friendly text for processing step
export function getProcessingStepText(
    status: string,
    processingStep: string | null
): string {
    const statusLower = status.toLowerCase();

    if (statusLower === "pending") {
        return "Queued";
    }

    if (statusLower === "processing") {
        switch (processingStep) {
            case "Queued":
                return "Starting...";
            case "Normalizing":
                return "Preparing audio...";
            case "Transcribing":
                return "Transcribing...";
            case "SpeakerDiarization":
                return "Identifying speakers...";
            case "Translating":
                return "Translating...";
            default:
                return processingStep || "Processing...";
        }
    }

    if (statusLower === "completed") {
        return "Done!";
    }

    if (statusLower === "failed") {
        return "Failed";
    }

    if (statusLower === "cancelled") {
        return "Cancelled";
    }

    if (statusLower === "uploading") {
        return "Uploading";
    }

    return status;
}
