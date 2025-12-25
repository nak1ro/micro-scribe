// Analysis API types

export type AnalysisType =
    | "ShortSummary"
    | "LongSummary"
    | "ActionItems"
    | "MeetingMinutes"
    | "Topics"
    | "Sentiment";

export interface TranscriptionAnalysisDto {
    id: string;
    analysisType: AnalysisType;
    content: string;
    translations: Record<string, string>;
    createdAtUtc: string;
}

export interface GenerateAnalysisRequest {
    types: (AnalysisType | "All")[];
}

export interface TranslateAnalysisRequest {
    targetLanguage: string;
}

// Parsed content types (for JSON content fields)
export interface ActionItem {
    task: string;
    assignee: string | null;
    deadline: string | null;
}

export interface MeetingMinutes {
    keyTopics: string[];
    decisions: string[];
    openQuestions: string[];
}

export interface SentimentResult {
    tone: "Positive" | "Neutral" | "Negative";
    emotions: string[];
}

// Helper to parse content based on analysis type
export function parseAnalysisContent<T>(content: string): T | null {
    try {
        return JSON.parse(content) as T;
    } catch {
        return null;
    }
}
