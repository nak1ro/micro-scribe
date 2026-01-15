// Centralized language constants for transcription feature
// Used by: LanguageMenu, ExportModal

export interface LanguageOption {
    code: string;
    name: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "uk", name: "Ukrainian" },
    { code: "ru", name: "Russian" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
];

export interface ExportOptionConfig {
    id: "txt" | "docx" | "srt" | "vtt" | "json" | "csv" | "mp3";
    label: string;
    description: string;
    icon: string;
}

export const EXPORT_FORMAT_OPTIONS: ExportOptionConfig[] = [
    {
        id: "txt",
        label: "Plain Text",
        description: "Simple text file",
        icon: "Page",
    },
    {
        id: "docx",
        label: "Word Document",
        description: "Microsoft Word format",
        icon: "TextBox",
    },
    {
        id: "srt",
        label: "SRT Subtitles",
        description: "Standard subtitle format",
        icon: "MediaVideo",
    },
    {
        id: "vtt",
        label: "VTT Subtitles",
        description: "Web Video Text Tracks",
        icon: "MediaVideo",
    },
    {
        id: "json",
        label: "JSON Data",
        description: "Full transcription data",
        icon: "Code",
    },
    {
        id: "csv",
        label: "CSV Spreadsheet",
        description: "Comma-separated values",
        icon: "Table2Columns",
    },
    {
        id: "mp3",
        label: "Audio (MP3)",
        description: "Download original audio",
        icon: "MusicDoubleNote",
    },
];

// Supported audio/video formats for upload
export const SUPPORTED_FILE_TYPES = [
    "audio/*",
    "video/*",
    ".mp3",
    ".wav",
    ".m4a",
    ".ogg",
    ".flac",
    ".mp4",
    ".mov",
    ".avi",
    ".webm",
];

// Quality options for transcription
export const QUALITY_OPTIONS = [
    { id: "standard", label: "Standard", description: "Faster processing" },
    { id: "enhanced", label: "Enhanced", description: "Higher accuracy" },
] as const;
