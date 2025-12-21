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
