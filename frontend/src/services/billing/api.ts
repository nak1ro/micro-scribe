import { apiClient, API_ENDPOINTS } from "@/services/api";
import type {
    BillingConfig,
    SetupIntentRequest,
    SetupIntentResponse,
    SubscribeRequest,
    SubscribeResponse,
    PortalRequest,
    PortalResponse,
    SubscriptionStatusResponse
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
    }
};
