import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@/services/billing";
import type { SetupIntentRequest, SubscribeRequest, PortalRequest, ChangePlanRequest } from "@/types/api/billing";

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

export const useSetupIntent = () => {
    return useMutation({
        mutationFn: (payload: SetupIntentRequest) => billingApi.createSetupIntent(payload),
    });
};

export const useSubscribe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: SubscribeRequest) => billingApi.subscribe(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["billing", "subscription"] });
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

export const useChangePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ChangePlanRequest) => billingApi.changePlan(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["billing", "subscription"] });
        },
    });
};

export const useCancelSubscription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (cancelImmediately?: boolean) => billingApi.cancelSubscription(cancelImmediately),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["billing", "subscription"] });
        },
    });
};

export const usePaymentMethod = () => {
    return useQuery({
        queryKey: ["billing", "payment-method"],
        queryFn: billingApi.getPaymentMethod,
    });
};

export const useInvoices = (limit = 10) => {
    return useQuery({
        queryKey: ["billing", "invoices", limit],
        queryFn: () => billingApi.getInvoices(limit),
    });
};
