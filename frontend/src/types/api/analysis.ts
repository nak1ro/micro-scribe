// API types for transcription analysis

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
    content: string; // JSON string
    translations: Record<string, string>;
    createdAtUtc: string;
}

export interface GenerateAnalysisRequest {
    types: (AnalysisType | "All")[];
}

export interface TranslateAnalysisRequest {
    targetLanguage: string;
}

// Parsed content types based on actual backend formats

export interface ShortSummaryContent {
    summary: string;
}

export interface LongSummarySection {
    title: string;
    content: string;
}

export interface LongSummaryContent {
    sections: LongSummarySection[];
}

export interface ActionItemContent {
    task: string;
    owner: string | null;
    priority: "High" | "Medium" | "Low";
}

export interface ActionItemsContent {
    actionItems: ActionItemContent[];
}

export interface MeetingMinutesContent {
    keyTopics: string[];
    decisions: string[];
    openQuestions: string[];
}

export interface TopicsContent {
    topics: string[];
}

export interface SentimentContent {
    sentiment: "Positive" | "Neutral" | "Negative";
    confidenceScore: number;
    explanation: string;
}

// Helper to parse analysis content
export function parseAnalysisContent<T>(content: string): T | null {
    try {
        return JSON.parse(content) as T;
    } catch {
        return null;
    }
}
