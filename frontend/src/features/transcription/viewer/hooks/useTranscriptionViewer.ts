import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranscriptionJob } from "@/features/transcription/hooks/useTranscriptions";
import { useAnalysis } from "@/features/transcription/analysis/hooks/useAnalysis";
import { useSegmentEdit } from "./useSegmentEdit";
import { useAudioSync } from "@/features/transcription/player/hooks/useAudioSync";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useEmailVerification } from "@/context/VerificationContext";
import { handleExport as exportFile } from "@/features/transcription/utils";
import { transcriptionApi } from "@/features/transcription/api";
import type { TranscriptionData, ExportFormat, ViewerSegment } from "@/features/transcription/types";
import type { AnalysisType, TranscriptionAnalysisDto } from "@/features/transcription/types/analysis";

interface UseTranscriptionViewerProps {
    jobId?: string;
    providedData?: TranscriptionData;
}

// Maps API job response to TranscriptionData
function mapJobToData(job: ReturnType<typeof useTranscriptionJob>["data"]): TranscriptionData | undefined {
    if (!job) return undefined;
    return {
        id: job.jobId,
        fileName: job.originalFileName,
        status: job.status.toLowerCase() as TranscriptionData["status"],
        processingStep: job.processingStep,
        durationSeconds: job.durationSeconds || 0,
        sourceLanguage: job.sourceLanguage || "en",
        translatedLanguages: job.translatedLanguages || [],
        translationStatus: job.translationStatus,
        translatingToLanguage: job.translatingToLanguage,
        enableSpeakerDiarization: job.enableSpeakerDiarization,
        speakers: job.speakers || [],
        segments: job.segments.map((s) => ({
            id: s.id,
            text: s.text,
            startSeconds: s.startSeconds,
            endSeconds: s.endSeconds,
            speaker: s.speaker,
            translations: s.translations || {},
            isEdited: s.isEdited,
            originalText: s.originalText,
        })),
        audioUrl: job.presignedUrl,
    };
}

export function useTranscriptionViewer({ jobId, providedData }: UseTranscriptionViewerProps) {
    const router = useRouter();
    const { limits } = usePlanLimits();
    const { isVerified, openModal: openVerificationModal } = useEmailVerification();

    // Data fetching
    const { data: job, isLoading, error, refetch } = useTranscriptionJob(jobId || "");
    const data: TranscriptionData | undefined = React.useMemo(
        () => providedData || mapJobToData(job),
        [providedData, job]
    );

    // UI state
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [showTimecodes, setShowTimecodes] = React.useState(true);
    const [showSpeakers, setShowSpeakers] = React.useState(true);
    const [copied, setCopied] = React.useState(false);
    const [displayLanguage, setDisplayLanguage] = React.useState<string | null>(null);
    const [isExporting, setIsExporting] = React.useState(false);
    const [currentAnalysisView, setCurrentAnalysisView] = React.useState<string>("transcript");
    const [isEditMode, setIsEditMode] = React.useState(false);
    const [editingSegment, setEditingSegment] = React.useState<ViewerSegment | null>(null);

    // Previous translating language ref for auto-switch
    const prevTranslatingRef = React.useRef<string | null>(null);

    // Segment editing
    const { updateSegment, revertSegment, revertAll, isUpdating, isReverting, getEditedSegments } =
        useSegmentEdit({ jobId: jobId || "" });

    // Analysis view selection handler
    const handleSelectAnalysisView = React.useCallback(
        (view: "transcript" | AnalysisType | TranscriptionAnalysisDto) => {
            const targetView = typeof view === "string" ? view : view.analysisType;
            setCurrentAnalysisView(targetView);
        },
        []
    );

    // Analysis
    const {
        analyses,
        isGenerating: isAnalysisGenerating,
        generatingTypes: generatingAnalysisTypes,
        generate: generateAnalysis,
        generateAll: generateAllAnalysis,
        getAnalysisByType,
        refetch: refetchAnalysis,
    } = useAnalysis({
        jobId: jobId || "",
        enabled: !!jobId && data?.status === "completed",
        onAnalysisCompleted: handleSelectAnalysisView,
    });

    // Auto-switch to translated language when complete
    React.useEffect(() => {
        if (!data) return;
        const wasTranslating = prevTranslatingRef.current;
        const nowTranslating = data.translatingToLanguage;

        if (wasTranslating && !nowTranslating && data.translatedLanguages.includes(wasTranslating)) {
            setDisplayLanguage(wasTranslating);
            refetchAnalysis();
        }
        prevTranslatingRef.current = nowTranslating;
    }, [data?.translatingToLanguage, data?.translatedLanguages, refetchAnalysis]);

    // Audio sync
    const { audioRef, currentTime, duration, isPlaying, activeSegmentIndex, toggle, seekTo, seekToSegment } =
        useAudioSync({ segments: data?.segments || [], audioUrl: data?.audioUrl || null });

    // Derived state
    const hasSpeakers = React.useMemo(
        () => data?.segments.some((seg) => seg.speaker !== null) || false,
        [data?.segments]
    );

    // Handlers
    const handleBack = React.useCallback(() => router.push("/dashboard"), [router]);

    const handleCopy = React.useCallback(async () => {
        if (!data) return;
        const text = data.segments
            .map((seg) => (displayLanguage && seg.translations?.[displayLanguage]) || seg.text)
            .join(" ");
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 800);
    }, [data, displayLanguage]);

    const handleExport = React.useCallback(
        async (format: ExportFormat) => {
            if (!data) return;
            setIsExporting(true);
            try {
                await exportFile(format, data.id, displayLanguage, data.audioUrl);
            } finally {
                setIsExporting(false);
            }
        },
        [data, displayLanguage]
    );

    const handleSegmentEditClick = React.useCallback((segment: ViewerSegment) => {
        setEditingSegment(segment);
    }, []);

    const handleSaveEdit = React.useCallback(
        async (segmentId: string, text: string) => {
            await updateSegment({ segmentId, text });
        },
        [updateSegment]
    );

    const handleRevertEdit = React.useCallback(
        async (segmentId: string) => {
            await revertSegment({ segmentId });
        },
        [revertSegment]
    );

    const handleRevertAll = React.useCallback(async () => {
        await revertAll();
    }, [revertAll]);

    const handleSkipBack = React.useCallback(() => {
        seekTo(Math.max(0, currentTime - 10));
    }, [seekTo, currentTime]);

    const handleSkipForward = React.useCallback(() => {
        seekTo(Math.min(duration, currentTime + 10));
    }, [seekTo, duration, currentTime]);

    const handleTranslate = React.useCallback(
        async (targetLanguage: string) => {
            if (!isVerified) {
                openVerificationModal();
                return;
            }
            if (!data?.id) return;
            try {
                await transcriptionApi.translateJob(data.id, targetLanguage);
                await refetch();
            } catch {
                // Silent fail - TODO: toast
            }
        },
        [isVerified, openVerificationModal, data?.id, refetch]
    );

    const handleGenerateAnalysis = React.useCallback(
        (types: AnalysisType[]) => {
            if (!isVerified) {
                openVerificationModal();
                return;
            }
            generateAnalysis(types);
        },
        [isVerified, openVerificationModal, generateAnalysis]
    );

    const handleGenerateAllAnalysis = React.useCallback(() => {
        if (!isVerified) {
            openVerificationModal();
            return;
        }
        generateAllAnalysis();
    }, [isVerified, openVerificationModal, generateAllAnalysis]);

    const handleToggleEditMode = React.useCallback(
        (enabled: boolean) => {
            if (!isVerified && enabled) {
                openVerificationModal();
                return;
            }
            setIsEditMode(enabled);
        },
        [isVerified, openVerificationModal]
    );

    return {
        // Data
        data,
        isLoading: isLoading && !providedData,
        error: error && !providedData && !data ? error : null,

        // UI state
        isSidebarOpen,
        setIsSidebarOpen,
        showTimecodes,
        setShowTimecodes,
        showSpeakers,
        setShowSpeakers,
        copied,
        displayLanguage,
        setDisplayLanguage,
        isExporting,
        currentAnalysisView,
        isEditMode,
        editingSegment,
        setEditingSegment,
        hasSpeakers,

        // Audio
        audioRef,
        currentTime,
        duration,
        isPlaying,
        activeSegmentIndex,

        // Analysis
        analyses,
        isAnalysisGenerating,
        generatingAnalysisTypes,
        getAnalysisByType,

        // Segment editing
        isUpdating,
        isReverting,
        getEditedSegments,

        // Plan limits
        limits,

        // Handlers
        handleBack,
        handleCopy,
        handleExport,
        handleSegmentEditClick,
        handleSaveEdit,
        handleRevertEdit,
        handleRevertAll,
        handleSkipBack,
        handleSkipForward,
        handleTranslate,
        handleGenerateAnalysis,
        handleGenerateAllAnalysis,
        handleSelectAnalysisView,
        handleToggleEditMode,
        toggle,
        seekTo,
        seekToSegment,
    };
}
