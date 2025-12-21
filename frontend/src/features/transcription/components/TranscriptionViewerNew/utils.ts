// Utility functions for TranscriptionViewerNew

// Format seconds to MM:SS or HH:MM:SS display
export function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Format seconds to compact timestamp (M:SS)
export function formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Get language display name from code
export function getLanguageName(code: string): string {
    const languages: Record<string, string> = {
        en: "English",
        uk: "Ukrainian",
        es: "Spanish",
        fr: "French",
        de: "German",
        it: "Italian",
        pt: "Portuguese",
        ru: "Russian",
        zh: "Chinese",
        ja: "Japanese",
        ko: "Korean",
        ar: "Arabic",
        auto: "Auto-detect",
    };
    return languages[code.toLowerCase()] || code.toUpperCase();
}

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

// Generate speaker color from name (consistent hash-based color)
export function getSpeakerColor(speaker: string): string {
    const colors = [
        "text-violet-500",
        "text-blue-500",
        "text-emerald-500",
        "text-amber-500",
        "text-rose-500",
        "text-cyan-500",
        "text-fuchsia-500",
        "text-lime-500",
    ];

    // Simple hash to get consistent color per speaker
    let hash = 0;
    for (let i = 0; i < speaker.length; i++) {
        hash = speaker.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// Check if speaker changed from previous segment
export function hasSpeakerChanged(
    currentSpeaker: string | null,
    previousSpeaker: string | null
): boolean {
    if (!currentSpeaker || !previousSpeaker) return false;
    return currentSpeaker !== previousSpeaker;
}
