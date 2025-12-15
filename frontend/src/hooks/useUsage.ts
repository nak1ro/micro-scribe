"use client";

import { useQuery } from "@tanstack/react-query";
import { usageApi } from "@/services/usage";

// Query key for usage data
const usageKeys = {
    all: ["usage"] as const,
    me: () => [...usageKeys.all, "me"] as const,
};

// Stale time: 5 minutes - limits rarely change
const STALE_TIME_MS = 5 * 60 * 1000;

// Cache time: 30 minutes
const GC_TIME_MS = 30 * 60 * 1000;

export function useUsage() {
    return useQuery({
        queryKey: usageKeys.me(),
        queryFn: () => usageApi.getMyUsage(),
        staleTime: STALE_TIME_MS,
        gcTime: GC_TIME_MS,
    });
}
