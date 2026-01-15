"use client";

import * as React from "react";
import { useTranscriptionJob } from "@/features/transcription/hooks/useTranscriptions";
import { transcriptionApi } from "@/features/transcription/api";
import { handleExport } from "@/features/transcription/utils/exportUtils";
import type { ExportFormat } from "@/features/transcription/types";

interface UseExportModalProps {
    jobId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function useExportModal({ jobId, isOpen, onClose }: UseExportModalProps) {
    const { data: job, refetch: refetchJob } = useTranscriptionJob(jobId);

    const [selectedFormat, setSelectedFormat] = React.useState<ExportFormat | null>(null);
    const [selectedLanguage, setSelectedLanguage] = React.useState<string | null>(null);
    const [isExporting, setIsExporting] = React.useState(false);
    const [isTranslating, setIsTranslating] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Derived data
    const isJobTranslating = job?.translationStatus === "Pending" || job?.translationStatus === "Translating";

    // Reset state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setSelectedFormat(null);
            setSelectedLanguage(null);
            setIsExporting(false);
            setIsTranslating(false);
            setError(null);
        }
    }, [isOpen]);

    // Poll for translation completion
    React.useEffect(() => {
        if (!isJobTranslating) {
            setIsTranslating(false);
            return;
        }

        const interval = setInterval(() => {
            refetchJob();
        }, 2000);

        return () => clearInterval(interval);
    }, [isJobTranslating, refetchJob]);

    const handleTranslate = async (langCode: string) => {
        if (isTranslating || isJobTranslating) return;
        setIsTranslating(true);
        setError(null);

        try {
            await transcriptionApi.translateJob(jobId, langCode);
            await refetchJob();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Translation failed";
            setError(message);
            setIsTranslating(false);
        }
    };

    const handleExportClick = async () => {
        if (!selectedFormat || !job) return;

        setIsExporting(true);
        setError(null);

        try {
            await handleExport(selectedFormat, job.jobId, selectedLanguage, job.presignedUrl);
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Export failed";
            setError(message);
        } finally {
            setIsExporting(false);
        }
    };

    return {
        job,
        selectedFormat,
        setSelectedFormat,
        selectedLanguage,
        setSelectedLanguage,
        isExporting,
        isTranslating,
        isJobTranslating,
        error,
        setError,
        handleTranslate,
        handleExportClick,
    };
}
