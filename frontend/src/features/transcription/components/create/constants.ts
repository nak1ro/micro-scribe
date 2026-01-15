import { TranscriptionQuality } from "@/features/transcription/types";

// Supported file formats for transcription upload
export const SUPPORTED_FORMATS = [".mp3", ".mp4", ".m4a", ".mov", ".aac", ".wav", ".ogg", ".opus", ".mpeg", ".wma", ".wmv"];

// Language options for source language selection
export const SOURCE_LANGUAGES = [
    { code: "auto", label: "Auto-detect" },
    { code: "en", label: "English" },
    { code: "pl", label: "Polish" },
    { code: "de", label: "German" },
    { code: "fr", label: "French" },
    { code: "es", label: "Spanish" },
    { code: "it", label: "Italian" },
    { code: "pt", label: "Portuguese" },
    { code: "nl", label: "Dutch" },
    { code: "ru", label: "Russian" },
    { code: "ja", label: "Japanese" },
    { code: "ko", label: "Korean" },
    { code: "zh", label: "Chinese" },
];

// Quality options for transcription
export const TRANSCRIPTION_QUALITY_OPTIONS = [
    { value: TranscriptionQuality.Fast, label: "Fast", description: "Quickest results" },
    { value: TranscriptionQuality.Balanced, label: "Balanced", description: "Best trade-off" },
    { value: TranscriptionQuality.Accurate, label: "Most Accurate", description: "Highest quality" },
];
