import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@/services/billing";
import type { CheckoutRequest, PortalRequest } from "@/types/api/billing";

export const useBillingConfig = () => {
    return useQuery({
        queryKey: ["billing", "config"],
        queryFn: billingApi.getConfig,
        staleTime: Infinity,
    });
};

export const useSubscriptionStatus = () => {
    return useQuery({
        queryKey: ["billing", "subscription"],
        queryFn: billingApi.getSubscriptionStatus,
    });
};

export const useCheckout = () => {
    return useMutation({
        mutationFn: (payload: CheckoutRequest) => billingApi.createCheckoutSession(payload),
        onSuccess: (data) => {
            if (data.url) {
                window.location.href = data.url;
            }
        },
    });
};

export const useCustomerPortal = () => {
    return useMutation({
        mutationFn: (payload: PortalRequest) => billingApi.createPortalSession(payload),
        onSuccess: (data) => {
            if (data.url) {
                window.location.href = data.url;
            }
        },
    });
};
