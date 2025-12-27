import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

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

// Generate speaker color from name (consistent hash-based color)
export function getSpeakerColor(speaker: string, customColor?: string | null): string {
    // If custom color provided from API, use it
    if (customColor) {
        return customColor;
    }

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

// Get background color variant for speaker badges
export function getSpeakerBgColor(speaker: string, customColor?: string | null): string {
    // If custom color provided from API, convert to bg variant
    if (customColor) {
        return customColor.replace("text-", "bg-").replace("-500", "-500/20");
    }

    const colors = [
        "bg-violet-500/20",
        "bg-blue-500/20",
        "bg-emerald-500/20",
        "bg-amber-500/20",
        "bg-rose-500/20",
        "bg-cyan-500/20",
        "bg-fuchsia-500/20",
        "bg-lime-500/20",
    ];

    let hash = 0;
    for (let i = 0; i < speaker.length; i++) {
        hash = speaker.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// Get speaker display name (use custom name or fallback to ID)
export function getSpeakerDisplayName(speakerId: string, displayName?: string | null): string {
    if (displayName) return displayName;
    // Convert "SPEAKER_00" to "Speaker 1" etc.
    const match = speakerId.match(/SPEAKER_(\d+)/i);
    if (match) {
        return `Speaker ${parseInt(match[1], 10) + 1}`;
    }
    return speakerId;
}

