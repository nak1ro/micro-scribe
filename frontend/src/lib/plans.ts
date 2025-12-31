// Centralized subscription plan configuration
// Single source of truth for plan limits, pricing, and features

export type PlanId = "free" | "pro";
export type BillingInterval = "monthly" | "yearly";

export interface PlanFeature {
    icon: string;
    text: string;
}

export interface PlanLimits {
    dailyTranscriptionLimit: number | null; // null = unlimited
    maxMinutesPerFile: number;
    maxFileSizeMB: number;
    maxFilesPerUpload: number;
    maxConcurrentJobs: number;
    priorityProcessing: boolean;
    translation: boolean;
    allModels: boolean;
    unlimitedStorage: boolean;
}

export interface Plan {
    id: PlanId;
    name: string;
    description: string;
    badge?: string;
    price: {
        monthly: number;
        yearly: number;
    };
    limits: PlanLimits;
    features: PlanFeature[];
    cta: {
        label: string;
        href: string;
    };
}

export const PLANS: Record<PlanId, Plan> = {
    free: {
        id: "free",
        name: "Free",
        description: "Perfect for getting started",
        price: {
            monthly: 0,
            yearly: 0,
        },
        limits: {
            dailyTranscriptionLimit: 3,
            maxMinutesPerFile: 10,
            maxFileSizeMB: 100, // 104857600 bytes
            maxFilesPerUpload: 1,
            maxConcurrentJobs: 1,
            priorityProcessing: false,
            translation: true,
            allModels: false,
            unlimitedStorage: false,
        },
        features: [
            { icon: "Upload", text: "3 files per day, up to 10 minutes each" },
            { icon: "Clock", text: "1 file at a time, lower priority queue" },
            { icon: "Download", text: "Basic export (TXT only)" },
            { icon: "CheckCircle", text: "Free access — no credit card required" },
        ],
        cta: {
            label: "Start Free",
            href: "/auth?mode=signup",
        },
    },
    pro: {
        id: "pro",
        name: "Pro",
        description: "Unlock full AI transcription power",
        badge: "Most Popular",
        price: {
            monthly: 19,
            yearly: 9, // $108/year
        },
        limits: {
            dailyTranscriptionLimit: null,
            maxMinutesPerFile: 180, // 3 hours
            maxFileSizeMB: 2048, // 2GB
            maxFilesPerUpload: 20,
            maxConcurrentJobs: 5,
            priorityProcessing: true,
            translation: true,
            allModels: true,
            unlimitedStorage: true,
        },
        features: [
            { icon: "Infinity", text: "Unlimited transcriptions, 20+ files at once" },
            { icon: "Upload", text: "Files up to 3 hours / 2GB" },
            { icon: "Zap", text: "Priority queue — faster processing" },
            { icon: "Download", text: "Multi-format export (TXT, DOCX, SRT, CSV, MP3)" },
            { icon: "Users", text: "Speaker recognition & timestamps" },
            { icon: "Sparkles", text: "AI summaries & translations" },
        ],
        cta: {
            label: "Get Pro",
            href: "/auth?mode=signup",
        },
    },
} as const;

// Helper to get plan by ID
export function getPlan(id: PlanId): Plan {
    return PLANS[id];
}

// Pricing helpers
export const ANNUAL_SAVINGS_PERCENT = 17;

export function formatPrice(cents: number): string {
    return `$${cents}`;
}

export function getPriceForInterval(plan: Plan, interval: BillingInterval): number {
    return interval === "monthly" ? plan.price.monthly : plan.price.yearly;
}
