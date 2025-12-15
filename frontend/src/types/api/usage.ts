// Usage API types - plan limits and usage statistics

export enum PlanType {
    Free = "Free",
    Pro = "Pro",
}

export interface UsageLimits {
    dailyTranscriptionLimit: number;
    maxMinutesPerFile: number;
    maxFileSizeBytes: number;
    maxConcurrentJobs: number;
    transcriptionJobPriority: boolean;
}

export interface UsageStats {
    usedMinutesThisMonth: number;
    jobsCleanedToday: number;
    activeJobs: number;
}

export interface UsageResponse {
    planType: PlanType;
    usage: UsageStats;
    limits: UsageLimits;
}
