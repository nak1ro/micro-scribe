import { apiClient, API_ENDPOINTS } from "@/services/api";
import { isAxiosError } from "axios";
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
} from "@/types/api/billing";

export const billingApi = {
    getConfig: async (): Promise<BillingConfig> => {
        const response = await apiClient.get<BillingConfig>(API_ENDPOINTS.BILLING.CONFIG);
        return response.data;
    },

    createSetupIntent: async (payload: SetupIntentRequest): Promise<SetupIntentResponse> => {
        const response = await apiClient.post<SetupIntentResponse>(
            API_ENDPOINTS.BILLING.SETUP_INTENT,
            payload
        );
        return response.data;
    },

    subscribe: async (payload: SubscribeRequest): Promise<SubscribeResponse> => {
        const response = await apiClient.post<SubscribeResponse>(
            API_ENDPOINTS.BILLING.SUBSCRIBE,
            payload
        );
        return response.data;
    },

    createPortalSession: async (payload: PortalRequest): Promise<PortalResponse> => {
        const response = await apiClient.post<PortalResponse>(API_ENDPOINTS.BILLING.PORTAL, payload);
        return response.data;
    },

    getSubscriptionStatus: async (): Promise<SubscriptionStatusResponse> => {
        const response = await apiClient.get<SubscriptionStatusResponse>(API_ENDPOINTS.BILLING.SUBSCRIPTION);
        return response.data;
    },

    changePlan: async (payload: ChangePlanRequest): Promise<ChangePlanResponse> => {
        const response = await apiClient.put<ChangePlanResponse>(
            API_ENDPOINTS.BILLING.CHANGE_PLAN,
            payload
        );
        return response.data;
    },

    cancelSubscription: async (cancelImmediately = false): Promise<CancelSubscriptionResponse> => {
        const response = await apiClient.delete<CancelSubscriptionResponse>(
            `${API_ENDPOINTS.BILLING.CANCEL}?cancelImmediately=${cancelImmediately}`
        );
        return response.data;
    },

    getPaymentMethod: async (): Promise<PaymentMethodResponse | null> => {
        try {
            const response = await apiClient.get<PaymentMethodResponse>(
                API_ENDPOINTS.BILLING.PAYMENT_METHOD
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
            `${API_ENDPOINTS.BILLING.INVOICES}?${params}`
        );
        return response.data;
    },
};
