export interface BillingConfig {
    publishableKey: string;
}

export type BillingInterval = 'Monthly' | 'Yearly';

// SetupIntent for Stripe Elements
export interface SetupIntentRequest {
    interval: BillingInterval;
}

export interface SetupIntentResponse {
    clientSecret: string;
}

// Subscribe after payment method confirmed
export interface SubscribeRequest {
    paymentMethodId: string;
    interval: BillingInterval;
}

export interface SubscribeResponse {
    subscriptionId: string;
    status: string;
}

// Portal session
export interface PortalRequest {
    returnUrl: string;
}

export interface PortalResponse {
    url: string;
}

// Subscription status
export enum SubscriptionPlan {
    Free = 0,
    Pro = 1
}

export enum SubscriptionStatus {
    Active = 0,
    Canceled = 1,
    PastDue = 2
}

export interface SubscriptionStatusResponse {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
}
