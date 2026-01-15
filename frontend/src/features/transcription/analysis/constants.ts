// Analysis configuration constants and utilities
// Used by ActionItemsView, AnalysisContentView, TLDRCard

// Priority configuration for action items
export interface PriorityConfig {
    bg: string;
    text: string;
    border: string;
    icon: string;
    label: string;
}

export const PRIORITY_CONFIGS: Record<string, PriorityConfig> = {
    High: {
        bg: "bg-red-500/10",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-500/20",
        icon: "🔴",
        label: "High Priority"
    },
    Medium: {
        bg: "bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-500/20",
        icon: "🟡",
        label: "Medium"
    },
    Low: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500/20",
        icon: "🟢",
        label: "Low"
    }
};

export const DEFAULT_PRIORITY_CONFIG: PriorityConfig = {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
    icon: "⚪",
    label: "Unknown"
};

export function getPriorityConfig(priority: string): PriorityConfig {
    return PRIORITY_CONFIGS[priority] || { ...DEFAULT_PRIORITY_CONFIG, label: priority };
}

// Color palette for topic tags
export const TOPIC_COLORS = [
    "bg-primary/10 text-primary hover:bg-primary/20",
    "bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20",
    "bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20",
    "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20",
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20",
];

// Sentiment configurations
export interface SentimentConfig {
    label: string;
    // UI Visuals
    color: string;
    bg: string;
    gradient: string;
    badge: string;
    bar: string;
    emoji: string;
}

export const SENTIMENT_CONFIGS: Record<string, SentimentConfig> = {
    Positive: {
        label: "Positive",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10",
        gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        bar: "bg-gradient-to-r from-emerald-500 to-emerald-400",
        emoji: "😊",
    },
    Negative: {
        label: "Negative",
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-500/10",
        gradient: "from-red-500/20 via-red-500/10 to-transparent",
        badge: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        bar: "bg-gradient-to-r from-red-500 to-red-400",
        emoji: "😔",
    },
    Neutral: {
        label: "Neutral",
        color: "text-slate-600 dark:text-slate-400",
        bg: "bg-slate-500/10",
        gradient: "from-slate-500/20 via-slate-500/10 to-transparent",
        badge: "bg-muted text-muted-foreground border-border",
        bar: "bg-gradient-to-r from-slate-400 to-slate-300",
        emoji: "😐",
    },
    Mixed: {
        label: "Mixed",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/10",
        gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
        badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        bar: "bg-gradient-to-r from-amber-500 to-amber-300",
        emoji: "🤔",
    }
};

export const DEFAULT_SENTIMENT_CONFIG: SentimentConfig = {
    label: "Unknown",
    color: "text-muted-foreground",
    bg: "bg-muted",
    gradient: "from-slate-500/20 via-slate-500/10 to-transparent",
    badge: "bg-muted text-muted-foreground border-border",
    bar: "bg-slate-300",
    emoji: "❓",
};

export function getSentimentConfig(sentiment: string): SentimentConfig {
    return SENTIMENT_CONFIGS[sentiment] || { ...DEFAULT_SENTIMENT_CONFIG, label: sentiment };
}

// Analysis Types Configuration
import { AnalysisType } from "@/features/transcription/types/analysis";

export interface AnalysisTypeConfig {
    type: AnalysisType;
    label: string;
    hasView: boolean;
}

export const ANALYSIS_TYPES_CONFIG: AnalysisTypeConfig[] = [
    { type: "ShortSummary", label: "TL;DR Summary", hasView: true },
    { type: "Topics", label: "Topics/Tags", hasView: true },
    { type: "Sentiment", label: "Sentiment Analysis", hasView: true },
    { type: "ActionItems", label: "Action Items", hasView: true },
    { type: "MeetingMinutes", label: "Meeting Minutes", hasView: true },
];

// Meeting Minutes Section Configuration
export interface MeetingSectionConfig {
    key: "keyTopics" | "decisions" | "openQuestions";
    title: string;
    borderColor: string;
    bgColor: string;
    iconColor: string;
    bulletColor: string;
}

export const MEETING_SECTIONS_CONFIG: MeetingSectionConfig[] = [
    {
        key: "keyTopics",
        title: "Key Topics",
        borderColor: "border-l-violet-500",
        bgColor: "bg-violet-500/5",
        iconColor: "text-violet-500",
        bulletColor: "bg-violet-500",
    },
    {
        key: "decisions",
        title: "Decisions Made",
        borderColor: "border-l-emerald-500",
        bgColor: "bg-emerald-500/5",
        iconColor: "text-emerald-500",
        bulletColor: "bg-emerald-500",
    },
    {
        key: "openQuestions",
        title: "Open Questions",
        borderColor: "border-l-amber-500",
        bgColor: "bg-amber-500/5",
        iconColor: "text-amber-500",
        bulletColor: "bg-amber-500",
    },
];
