"use client";

import { useUsage } from "@/hooks/useUsage";
import { PLANS, type PlanId } from "@/lib/plans";
import type { ExportFormat } from "@/features/transcription/types";



export function usePlanLimits() {
    const { data: usage, isLoading } = useUsage();

    // Determine plan ID from usage response
    const planId: PlanId = usage?.planType === "Pro" ? "pro" : "free";
    const plan = PLANS[planId];
    const limits = plan.limits;
    const isPro = planId === "pro";

    // Get remaining transcriptions for today (Free users only)
    const usedToday = usage?.usage.jobsCleanedToday ?? 0;
    const dailyLimit = limits.dailyTranscriptionLimit;
    const remainingToday = dailyLimit !== null ? Math.max(0, dailyLimit - usedToday) : null;

    // Check if user can create a new transcription
    const canTranscribe = (): boolean => {
        if (isPro) return true;
        return remainingToday === null || remainingToday > 0;
    };

    // Check if file size is within limits
    const isFileSizeValid = (fileSizeBytes: number): boolean => {
        const maxBytes = limits.maxFileSizeMB * 1024 * 1024;
        return fileSizeBytes <= maxBytes;
    };

    // Check if export format is available for current plan
    // Check if export format is available for current plan
    const canExport = (format: ExportFormat): boolean => {
        return limits.allowedExportFormats.includes(format);
    };

    // Get list of available export formats
    // Get list of available export formats
    const getAvailableExportFormats = (): ExportFormat[] => {
        return limits.allowedExportFormats;
    };

    // Check if translation is available
    const canTranslate = (): boolean => {
        return limits.translation;
    };

    // Check if speaker diarization is available
    const canUseSpeakerDiarization = (): boolean => {
        return isPro; // Pro feature
    };

    return {
        // Plan info
        planId,
        plan,
        isPro,
        isLoading,

        // Limits from PLANS
        limits,
        maxFileSizeMB: limits.maxFileSizeMB,
        maxMinutesPerFile: limits.maxMinutesPerFile,
        dailyLimit,

        // Usage
        usedToday,
        remainingToday,

        // Validation helpers
        canTranscribe,
        isFileSizeValid,
        canExport,
        getAvailableExportFormats,
        canTranslate,
        canUseSpeakerDiarization,
    };
}
