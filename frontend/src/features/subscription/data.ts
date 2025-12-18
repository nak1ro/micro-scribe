import { SubscriptionPlan, PlanTier, BillingHistoryItem } from "./types";

// Plan configuration - mirrors landing page pricing
export const planTiers: PlanTier[] = [
    {
        name: "Free Plan",
        plan: SubscriptionPlan.Free,
        price: "$0",
        period: "forever",
        priceLabel: "100% Free",
        description: "Perfect for trying out",
        features: [
            {
                icon: "Upload",
                title: "10 Free Uploads Daily",
                description: "Upload 10 files per day, up to 10 minutes each",
            },
            {
                icon: "CheckCircle",
                title: "100% Free Access",
                description: "Try AI transcription with basic limits",
            },
            {
                icon: "Clock",
                title: "Standard Processing",
                description: "Standard priority, transcription may take a bit longer",
            },
        ],
        highlighted: false,
    },
    {
        name: "Premium Plan",
        plan: SubscriptionPlan.Pro,
        price: "$12",
        period: "month",
        priceLabel: "Billed Monthly",
        description: "Unlock Full AI Transcription Power",
        features: [
            {
                icon: "Infinity",
                title: "Unlimited Transcriptions",
                description: "No daily limits, transcribe as much as you need",
            },
            {
                icon: "Upload",
                title: "Extended File Uploads",
                description: "Upload files up to 5 hours or 1GB and process 50 files at once",
            },
            {
                icon: "Sparkles",
                title: "Advanced AI Features",
                description: "50+ languages, bulk exports, speaker recognition & more",
            },
            {
                icon: "Zap",
                title: "Priority Processing",
                description: "Get lightning-fast transcriptions, always at the front of the queue",
            },
        ],
        highlighted: true,
    },
];

// Mock billing history for UI development
export const mockBillingHistory: BillingHistoryItem[] = [
    {
        id: "inv_001",
        date: new Date("2024-12-01"),
        amount: 12.0,
        currency: "USD",
        status: "paid",
        invoiceUrl: "#",
    },
    {
        id: "inv_002",
        date: new Date("2024-11-01"),
        amount: 12.0,
        currency: "USD",
        status: "paid",
        invoiceUrl: "#",
    },
    {
        id: "inv_003",
        date: new Date("2024-10-01"),
        amount: 12.0,
        currency: "USD",
        status: "paid",
        invoiceUrl: "#",
    },
];

// Subscription messaging
export const subscriptionCopy = {
    pageTitle: "Subscription & Billing",
    pageDescription: "Manage your subscription plan and billing details",
    currentPlanBadge: "Your Plan",
    upgradeButton: "Upgrade to Pro",
    downgradeButton: "Downgrade to Free",
    currentPlanButton: "Current Plan",
    cancelButton: "Cancel Subscription",
    manageBillingButton: "Manage Billing",
    billingHistoryTitle: "Billing History",
    noBillingHistory: "No billing history yet",
    confirmDowngrade: "Are you sure you want to downgrade to the Free plan? You'll lose access to premium features at the end of your billing period.",
    confirmCancel: "Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.",
};
