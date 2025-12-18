// Subscription plan types
export enum SubscriptionPlan {
    Free = "Free",
    Pro = "Pro",
}

// Billing history item for invoice display
export interface BillingHistoryItem {
    id: string;
    date: Date;
    amount: number;
    currency: string;
    status: "paid" | "pending" | "failed";
    invoiceUrl?: string;
}

// Feature item for plan display
export interface PlanFeature {
    icon: string;
    title: string;
    description: string;
}

// Plan tier configuration
export interface PlanTier {
    name: string;
    plan: SubscriptionPlan;
    price: string;
    period: string;
    priceLabel?: string;
    description: string;
    features: PlanFeature[];
    highlighted: boolean;
}
