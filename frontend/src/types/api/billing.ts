export interface BillingConfig {
    publishableKey: string;
}

export type BillingInterval = 'Monthly' | 'Yearly';

export interface CheckoutRequest {
    interval: BillingInterval;
    successUrl?: string;
    cancelUrl?: string;
}

export interface CheckoutResponse {
    sessionId: string;
    url: string;
}

export interface PortalRequest {
    returnUrl: string;
}

export interface PortalResponse {
    url: string;
}

export enum SubscriptionPlan {
    Free = 0,
    Pro = 1
}

export enum SubscriptionStatus {
    Active = 0,
    Canceled = 1,
    Incomplete = 2,
    IncompleteExpired = 3,
    PastDue = 4,
    Trialing = 5,
    Unpaid = 6
}

export interface SubscriptionStatusResponse {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
}
