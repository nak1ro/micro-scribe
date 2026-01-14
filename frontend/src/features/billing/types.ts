// Billing configuration
export interface BillingConfig {
    publishableKey: string;
}

export type BillingInterval = "Monthly" | "Yearly";

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
export type SubscriptionPlan = "Free" | "Pro";
export type SubscriptionStatus = "Active" | "Canceled" | "PastDue" | "Incomplete";

export interface SubscriptionStatusResponse {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    interval: BillingInterval;
}

// Change plan interval
export interface ChangePlanRequest {
    newInterval: BillingInterval;
}

export interface ChangePlanResponse {
    subscriptionId: string;
    status: string;
}

// Cancel subscription
export interface CancelSubscriptionResponse {
    message: string;
}

// Payment method
export interface PaymentMethodResponse {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
}

// Invoices
export interface InvoiceItem {
    id: string;
    createdAtUtc: string;
    amountCents: number;
    currency: string;
    status: "paid" | "pending" | "failed";
    invoicePdf: string | null;
}

export interface InvoiceListResponse {
    invoices: InvoiceItem[];
    hasMore: boolean;
    nextCursor: string | null;
}

// Error response (RFC 7807)
export interface BillingError {
    type?: string;
    title: string;
    status: number;
    detail?: string;
}
