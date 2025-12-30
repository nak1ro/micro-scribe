// Pricing page content - derived from centralized PLANS config

import { PLANS, ANNUAL_SAVINGS_PERCENT } from "@/lib/plans";
import type { PlanFeature } from "@/lib/plans";

// Re-export for convenience
export { ANNUAL_SAVINGS_PERCENT };
export type { PlanFeature };

// Plan limits derived from centralized config
export const planLimits = {
    free: PLANS.free.limits,
    pro: PLANS.pro.limits,
};

// Billing interval options
export type BillingInterval = "monthly" | "annual";

// Feature comparison row for the table
export interface FeatureRow {
    feature: string;
    free: string | boolean;
    pro: string | boolean;
    tooltip?: string;
}

// Pricing configuration derived from PLANS
export const pricingConfig = {
    monthly: {
        free: PLANS.free.price.monthly,
        pro: PLANS.pro.price.monthly,
    },
    annual: {
        free: PLANS.free.price.yearly,
        pro: PLANS.pro.price.yearly,
    },
    annualSavingsPercent: ANNUAL_SAVINGS_PERCENT,
};

// Hero section content
export const pricingHeroContent = {
    headline: "Simple, Transparent Pricing",
    subheadline: "Start free, upgrade when you need more power. No hidden fees, cancel anytime.",
};

// Plan card content derived from centralized PLANS
export const planCardContent = {
    free: {
        name: PLANS.free.name,
        description: PLANS.free.description,
        features: [
            { icon: "Upload", text: `${planLimits.free.dailyTranscriptionLimit} transcriptions per day` },
            { icon: "Clock", text: `Up to ${planLimits.free.maxMinutesPerFile} minutes per file` },
            { icon: "Download", text: `${planLimits.free.maxFileSizeMB}MB max file size` },
            { icon: "CheckCircle", text: "Standard processing speed" },
            { icon: "CheckCircle", text: "Basic transcription models" },
        ] as PlanFeature[],
        cta: PLANS.free.cta.label,
        ctaHref: PLANS.free.cta.href,
    },
    pro: {
        name: PLANS.pro.name,
        description: PLANS.pro.description,
        badge: PLANS.pro.badge,
        features: [
            { icon: "Infinity", text: "Unlimited transcriptions" },
            { icon: "Upload", text: `Up to ${planLimits.pro.maxMinutesPerFile / 60} hours per file` },
            { icon: "Download", text: `${planLimits.pro.maxFileSizeMB / 1024}GB max file size` },
            { icon: "Zap", text: "Priority processing" },
            { icon: "Sparkles", text: "All AI models & translation" },
            { icon: "Users", text: "Unlimited storage" },
        ] as PlanFeature[],
        cta: PLANS.pro.cta.label,
        ctaHref: PLANS.pro.cta.href,
    },
};

// Feature comparison table data
export const featureComparisonData: FeatureRow[] = [
    {
        feature: "Daily Transcriptions",
        free: `${planLimits.free.dailyTranscriptionLimit} per day`,
        pro: "Unlimited",
    },
    {
        feature: "Max File Duration",
        free: `${planLimits.free.maxMinutesPerFile} minutes`,
        pro: `${planLimits.pro.maxMinutesPerFile / 60} hours`,
    },
    {
        feature: "Max File Size",
        free: `${planLimits.free.maxFileSizeMB}MB`,
        pro: `${planLimits.pro.maxFileSizeMB / 1024}GB`,
    },
    {
        feature: "Files Per Upload",
        free: `${planLimits.free.maxFilesPerUpload}`,
        pro: `${planLimits.pro.maxFilesPerUpload}`,
    },
    {
        feature: "Concurrent Jobs",
        free: `${planLimits.free.maxConcurrentJobs}`,
        pro: `${planLimits.pro.maxConcurrentJobs}`,
    },
    {
        feature: "Priority Processing",
        free: false,
        pro: true,
    },
    {
        feature: "Translation",
        free: false,
        pro: true,
    },
    {
        feature: "All AI Models",
        free: false,
        pro: true,
    },
    {
        feature: "Unlimited Storage",
        free: false,
        pro: true,
    },
];

// FAQ questions for pricing page
export const pricingFAQContent = {
    heading: "Frequently Asked Questions",
    questions: [
        {
            question: "Can I cancel my subscription anytime?",
            answer: "Yes, you can cancel your subscription at any time from your account settings. You'll retain access to Pro features until the end of your billing period.",
        },
        {
            question: "What happens if I downgrade to Free?",
            answer: "You'll keep access to Pro features until your current billing period ends. After that, you'll be on the Free plan with standard limits. Your transcriptions are never deleted.",
        },
        {
            question: "Do you offer refunds?",
            answer: "Yes, we offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact us for a full refund.",
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. All payments are processed securely through Stripe.",
        },
        {
            question: "Is there a limit on file size or duration?",
            answer: `Free users can upload files up to ${planLimits.free.maxFileSizeMB}MB and ${planLimits.free.maxMinutesPerFile} minutes. Pro users get ${planLimits.pro.maxFileSizeMB / 1024}GB and ${planLimits.pro.maxMinutesPerFile / 60} hours per file.`,
        },
        {
            question: "What happens if I exceed my daily limit?",
            answer: "Free users are limited to 10 transcriptions per day. Once you reach the limit, you can upgrade to Pro for unlimited transcriptions or wait until the next day.",
        },
    ],
};

// Trust signals
export const trustSignals = [
    { icon: "Shield", text: "Bank-level Security" },
    { icon: "CreditCard", text: "Secure Payments via Stripe" },
    { icon: "RefreshCw", text: "14-Day Money Back" },
    { icon: "Lock", text: "GDPR Compliant" },
];

// Final CTA
export const pricingCTAContent = {
    headline: "Ready to Get Started?",
    subheadline: "Join thousands of users transcribing with AI",
    cta: "Start Free — No Credit Card",
    ctaHref: "/auth?mode=signup",
};
