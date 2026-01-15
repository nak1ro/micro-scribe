import { AVAILABLE_LANGUAGES, QUALITY_OPTIONS, SUPPORTED_FILE_TYPES } from "@/features/transcription/constants"
import { TranscriptionQuality } from "@/features/transcription/types"

export const SOURCE_LANGUAGES = AVAILABLE_LANGUAGES.map(l => ({
    code: l.code,
    label: l.name
}));

const QUALITY_MAP: Record<string, TranscriptionQuality> = {
    "fast": TranscriptionQuality.Fast,
    "balanced": TranscriptionQuality.Balanced,
    "accurate": TranscriptionQuality.Accurate
};

export const TRANSCRIPTION_QUALITY_OPTIONS = QUALITY_OPTIONS.map(q => ({
    value: QUALITY_MAP[q.id] ?? TranscriptionQuality.Balanced,
    label: q.label,
    description: q.description
}));

export const SUPPORTED_FORMATS = SUPPORTED_FILE_TYPES;
