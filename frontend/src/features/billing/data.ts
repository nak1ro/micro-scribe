// Billing page content and configuration
// No concrete types since billing backend not yet implemented

import { planLimits } from "@/features/marketing/landing/data/content";

// Copy for billing page
export const billingCopy = {
    pageTitle: "Billing & Subscription",
    pageDescription: "Manage your subscription and billing details",
    currentPlanLabel: "Current Plan",
    changePlanLabel: "Change Plan",
    billingCycleLabel: "Billing Cycle",
    nextBillingLabel: "Next Billing Date",
    cancelTitle: "Cancel Subscription",
    cancelDescription: "Cancel your subscription. You'll retain access until the end of your billing period.",
    cancelButton: "Cancel Subscription",
    cancelConfirmTitle: "Are you sure?",
    cancelConfirmMessage: "You'll lose access to Pro features at the end of your billing period. Your transcriptions will be preserved.",
    savingsMessage: "Switch to annual billing and save $24/year!",
};

// Plan display data
export const planDisplayData = {
    Free: {
        name: "Free Plan",
        badge: "Current",
        color: "muted",
        limits: [
            `${planLimits.free.dailyTranscriptionLimit} transcriptions/day`,
            `${planLimits.free.maxMinutesPerFile} min per file`,
            "Standard processing",
        ],
    },
    Pro: {
        name: "Pro Plan",
        badge: "Pro",
        color: "primary",
        limits: [
            "Unlimited transcriptions",
            `${planLimits.pro.maxMinutesPerFile / 60} hours per file`,
            "Priority processing",
        ],
    },
};

// Locked features to show for upsell (Free users only)
export const lockedFeatures = [
    {
        icon: "Infinity",
        title: "Unlimited Transcriptions",
        description: "No daily limits",
    },
    {
        icon: "Zap",
        title: "Priority Processing",
        description: "Skip the queue",
    },
    {
        icon: "Languages",
        title: "Translation",
        description: "Translate to 50+ languages",
    },
    {
        icon: "Database",
        title: "Unlimited Storage",
        description: "Never delete your files",
    },
];
