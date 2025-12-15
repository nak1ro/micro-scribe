import { apiClient, API_ENDPOINTS } from "@/services/api";
import type { UsageResponse } from "@/types/api/usage";

export const usageApi = {
    getMyUsage: async (): Promise<UsageResponse> => {
        const response = await apiClient.get<UsageResponse>(API_ENDPOINTS.USAGE.ME);
        return response.data;
    },
};
