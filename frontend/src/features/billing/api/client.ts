import { apiClient } from "@/services/api";
import { isAxiosError } from "axios";
import { BILLING_ENDPOINTS } from "./routes";
import type {
    BillingConfig,
    SetupIntentRequest,
    SetupIntentResponse,
    SubscribeRequest,
    SubscribeResponse,
    PortalRequest,
    PortalResponse,
    SubscriptionStatusResponse,
    ChangePlanRequest,
    ChangePlanResponse,
    CancelSubscriptionResponse,
    PaymentMethodResponse,
    InvoiceListResponse,
} from "../types";

export const billingApi = {
    getConfig: async (): Promise<BillingConfig> => {
        const response = await apiClient.get<BillingConfig>(BILLING_ENDPOINTS.CONFIG);
        return response.data;
    },

    createSetupIntent: async (payload: SetupIntentRequest): Promise<SetupIntentResponse> => {
        const response = await apiClient.post<SetupIntentResponse>(
            BILLING_ENDPOINTS.SETUP_INTENT,
            payload
        );
        return response.data;
    },

    subscribe: async (payload: SubscribeRequest): Promise<SubscribeResponse> => {
        const response = await apiClient.post<SubscribeResponse>(
            BILLING_ENDPOINTS.SUBSCRIBE,
            payload
        );
        return response.data;
    },

    createPortalSession: async (payload: PortalRequest): Promise<PortalResponse> => {
        const response = await apiClient.post<PortalResponse>(BILLING_ENDPOINTS.PORTAL, payload);
        return response.data;
    },

    getSubscriptionStatus: async (): Promise<SubscriptionStatusResponse> => {
        const response = await apiClient.get<SubscriptionStatusResponse>(BILLING_ENDPOINTS.SUBSCRIPTION);
        return response.data;
    },

    changePlan: async (payload: ChangePlanRequest): Promise<ChangePlanResponse> => {
        const response = await apiClient.put<ChangePlanResponse>(
            BILLING_ENDPOINTS.CHANGE_PLAN,
            payload
        );
        return response.data;
    },

    cancelSubscription: async (cancelImmediately = false): Promise<CancelSubscriptionResponse> => {
        const response = await apiClient.delete<CancelSubscriptionResponse>(
            `${BILLING_ENDPOINTS.CANCEL}?cancelImmediately=${cancelImmediately}`
        );
        return response.data;
    },

    getPaymentMethod: async (): Promise<PaymentMethodResponse | null> => {
        try {
            const response = await apiClient.get<PaymentMethodResponse>(
                BILLING_ENDPOINTS.PAYMENT_METHOD
            );
            return response.data;
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    getInvoices: async (limit = 10, startingAfter?: string): Promise<InvoiceListResponse> => {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (startingAfter) params.append("startingAfter", startingAfter);
        const response = await apiClient.get<InvoiceListResponse>(
            `${BILLING_ENDPOINTS.INVOICES}?${params}`
        );
        return response.data;
    },
};
