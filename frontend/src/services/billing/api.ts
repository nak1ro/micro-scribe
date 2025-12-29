import { apiClient, API_ENDPOINTS } from "@/services/api";
import type {
    BillingConfig,
    CheckoutRequest,
    CheckoutResponse,
    PortalRequest,
    PortalResponse,
    SubscriptionStatusResponse
} from "@/types/api/billing";

export const billingApi = {
    getConfig: async (): Promise<BillingConfig> => {
        const response = await apiClient.get<BillingConfig>(API_ENDPOINTS.BILLING.CONFIG);
        return response.data;
    },

    createCheckoutSession: async (payload: CheckoutRequest): Promise<CheckoutResponse> => {
        const response = await apiClient.post<CheckoutResponse>(API_ENDPOINTS.BILLING.CHECKOUT, payload);
        return response.data;
    },

    createPortalSession: async (payload: PortalRequest): Promise<PortalResponse> => {
        const response = await apiClient.post<PortalResponse>(API_ENDPOINTS.BILLING.PORTAL, payload);
        return response.data;
    },

    getSubscriptionStatus: async (): Promise<SubscriptionStatusResponse> => {
        const response = await apiClient.get<SubscriptionStatusResponse>(API_ENDPOINTS.BILLING.SUBSCRIPTION);
        return response.data;
    }
};
