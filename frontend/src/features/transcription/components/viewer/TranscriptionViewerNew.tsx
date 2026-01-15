"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { RefreshDouble, WarningCircle } from "iconoir-react";
import { Button } from "@/components/ui";
import { useTranscriptionJob } from "@/features/transcription/hooks/useTranscriptions";
import { useAnalysis } from "@/features/transcription/hooks/useAnalysis";
import { useSegmentEdit } from "@/features/transcription/hooks/useSegmentEdit";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useEmailVerification } from "@/context/VerificationContext";

import { ViewerHeader } from "./ViewerHeader";
import { ViewerLayout } from "./ViewerLayout";
import { ViewerSkeleton } from "./ViewerSkeleton";
import { ViewerStatus, ViewerError } from "./ViewerStatus";
import { TranscriptContent } from "../transcript/TranscriptContent";
import { AudioPlayer } from "../player/AudioPlayer";
import { ActionsSidebar } from "./ActionsSidebar";
import { SegmentEditModal } from "../modals/SegmentEditModal";
import { ActionItemsView } from "@/features/transcription";
import { MeetingMinutesView } from "@/features/transcription";
import { AnalysisContentView } from "@/features/transcription";
import { useAudioSync } from "@/features/transcription";
import { handleExport as exportFile } from "@/features/transcription/utils";
import { getProcessingStepText } from "@/features/transcription/utils";
import { transcriptionApi } from "@/features/transcription/api";
import type { TranscriptionData, ExportFormat, ViewerSegment } from "@/features/transcription/types";
import type { AnalysisType, TranscriptionAnalysisDto } from "@/features/transcription/types/analysis";

interface TranscriptionViewerNewProps {
    // For now, use mock data. Later, this will accept jobId and fetch real data
    jobId?: string;
    data?: TranscriptionData;
    className?: string;
}

export function TranscriptionViewerNew({
    jobId,
    data: providedData,
    className
}: TranscriptionViewerNewProps) {
    const router = useRouter();
    const { limits } = usePlanLimits();
    const { isVerified, openModal: openVerificationModal } = useEmailVerification();

    // Fetch data if jobId is provided
    const { data: job, isLoading, error, refetch } = useTranscriptionJob(jobId || "");

    // Use provided data, mapped job data, or mock data (only as fallback if no jobId/data)
    const data: TranscriptionData | undefined = React.useMemo(() => {
        if (providedData) return providedData;

        if (job) {
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
                    originalText: s.originalText
                })),
                audioUrl: job.presignedUrl
            };
        }

        return undefined;
    }, [providedData, job]);

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [showTimecodes, setShowTimecodes] = React.useState(true);
    const [showSpeakers, setShowSpeakers] = React.useState(true);
    const [copied, setCopied] = React.useState(false);
    const [displayLanguage, setDisplayLanguage] = React.useState<string | null>(null);
    const [isExporting, setIsExporting] = React.useState(false);

    // Track the language being translated to auto-switch when complete
    const prevTranslatingRef = React.useRef<string | null>(null);

    // Active analysis view state ("transcript" or AnalysisType)
    const [currentAnalysisView, setCurrentAnalysisView] = React.useState<string>("transcript");

    // Edit mode state
    const [isEditMode, setIsEditMode] = React.useState(false);
    const [editingSegment, setEditingSegment] = React.useState<ViewerSegment | null>(null);

    // Segment editing hook
    const {
        updateSegment,
        revertSegment,
        revertAll,
        isUpdating,
        isReverting,
        getEditedSegments,
    } = useSegmentEdit({ jobId: jobId || "" });

    // Handler to switch analysis view
    const handleSelectAnalysisView = React.useCallback((view: "transcript" | AnalysisType | TranscriptionAnalysisDto) => {
        const targetView = typeof view === 'string' ? view : view.analysisType;
        setCurrentAnalysisView(targetView);
    }, []);

    // Analysis hook
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
        onAnalysisCompleted: handleSelectAnalysisView
    });

    // Auto-switch to translated language when translation completes
    React.useEffect(() => {
        if (!data) return;

        const wasTranslating = prevTranslatingRef.current;
        const nowTranslating = data.translatingToLanguage;

        // If we were translating and now we're not, check if the language was added
        if (wasTranslating && !nowTranslating) {
            if (data.translatedLanguages.includes(wasTranslating)) {
                setDisplayLanguage(wasTranslating);
                // Refetch analysis to get translated versions
                refetchAnalysis();
            }
        }

        prevTranslatingRef.current = nowTranslating;
    }, [data?.translatingToLanguage, data?.translatedLanguages, refetchAnalysis]);

    // Audio sync hook
    const {
        audioRef,
        currentTime,
        duration,
        isPlaying,
        activeSegmentIndex,
        toggle,
        seekTo,
        seekToSegment,
    } = useAudioSync({
        segments: data?.segments || [],
        audioUrl: data?.audioUrl || null
    });

    // Check if any segment has a speaker
    const hasSpeakers = React.useMemo(() =>
        data?.segments.some(seg => seg.speaker !== null) || false,
        [data?.segments]
    );

    // Handlers
    const handleBack = () => {
        router.push("/dashboard");
    };

    const handleCopy = async () => {
        if (!data) return;
        // Copy text in the currently displayed language
        const text = data.segments.map(seg => {
            if (displayLanguage && seg.translations?.[displayLanguage]) {
                return seg.translations[displayLanguage];
            }
            return seg.text;
        }).join(" ");
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExport = async (format: ExportFormat) => {
        if (!data) return;

        setIsExporting(true);
        try {
            // Export in the currently displayed language
            await exportFile(format, data.id, displayLanguage, data.audioUrl);
        } catch {
            // TODO: Add toast notification for export errors
        } finally {
            setIsExporting(false);
        }
    };

    const handleEdit = () => {
        // Toggle edit mode
        setIsEditMode((prev) => !prev);
    };

    // Handle segment edit click
    const handleSegmentEditClick = (segment: ViewerSegment) => {
        setEditingSegment(segment);
    };

    // Handle save from modal
    const handleSaveEdit = async (segmentId: string, text: string) => {
        await updateSegment({ segmentId, text });
    };

    // Handle revert from modal
    const handleRevertEdit = async (segmentId: string) => {
        await revertSegment({ segmentId });
    };

    // Handle revert all
    const handleRevertAll = async () => {
        await revertAll();
    };

    const handleSkipBack = () => {
        seekTo(Math.max(0, currentTime - 10));
    };

    const handleSkipForward = () => {
        seekTo(Math.min(duration, currentTime + 10));
    };

    const handleTranslate = async (targetLanguage: string) => {
        // Block for unverified users
        if (!isVerified) {
            openVerificationModal();
            return;
        }
        if (!data?.id) return;
        try {
            await transcriptionApi.translateJob(data.id, targetLanguage);
            // Immediately refetch to pick up the new translationStatus and start polling
            await refetch();
        } catch {
            // Translation failed - silently fail for now
            // TODO: Add toast notification for translation errors
        }
    };

    // Guarded analysis generation - blocks unverified users
    const handleGenerateAnalysis = (types: AnalysisType[]) => {
        if (!isVerified) {
            openVerificationModal();
            return;
        }
        generateAnalysis(types);
    };

    const handleGenerateAllAnalysis = () => {
        if (!isVerified) {
            openVerificationModal();
            return;
        }
        generateAllAnalysis();
    };

    // Guarded edit mode toggle - blocks unverified users
    const handleToggleEditMode = (enabled: boolean) => {
        if (!isVerified && enabled) {
            openVerificationModal();
            return;
        }
        setIsEditMode(enabled);
    };

    // Loading state - skeleton UI
    if (isLoading && !providedData) {
        return <ViewerSkeleton />;
    }

    // Error state
    if (error && !providedData && !data) {
        return <ViewerError error={error} onBack={handleBack} />;
    }

    if (!data) {
        return null; // Should not happen given logic above
    }

    // Pending/Processing state
    if (data.status === "pending" || data.status === "processing") {
        const stepText = getProcessingStepText(data.status, data.processingStep);
        return <ViewerStatus data={data} onToggleSidebar={() => setIsSidebarOpen(true)} onBack={handleBack} />;
    }

    // Completed state - full viewer
    return (
        <div className={cn("h-full", className)}>
            {/* Export Notification */}
            {isExporting && (
                <div className="fixed bottom-6 right-6 z-[100] bg-card text-foreground px-5 py-4 rounded-xl shadow-xl flex items-center gap-3 border border-border">
                    <RefreshDouble className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm font-semibold">Preparing download...</span>
                </div>
            )}

            {/* Hidden audio element */}
            {data.audioUrl && (
                <audio
                    ref={audioRef}
                    src={data.audioUrl}
                    className="hidden"
                    aria-label="Transcription audio"
                    crossOrigin="anonymous"
                />
            )}

            <ViewerLayout
                isSidebarOpen={isSidebarOpen}
                onCloseSidebar={() => setIsSidebarOpen(false)}
                sidebar={
                    <ActionsSidebar
                        onCopy={handleCopy}
                        isCopied={copied}
                        canCopy={data.segments.length > 0}
                        showTimecodes={showTimecodes}
                        onToggleTimecodes={setShowTimecodes}
                        showSpeakers={showSpeakers}
                        onToggleSpeakers={setShowSpeakers}
                        hasSpeakers={hasSpeakers}
                        onExport={handleExport}
                        onTranslate={handleTranslate}
                        translatedLanguages={data.translatedLanguages}
                        translationStatus={data.translationStatus}
                        translatingToLanguage={data.translatingToLanguage}
                        canTranslate={limits.translation}
                        sourceLanguage={data.sourceLanguage}
                        displayLanguage={displayLanguage}
                        onDisplayLanguageChange={setDisplayLanguage}
                        analyses={analyses}
                        isAnalysisGenerating={isAnalysisGenerating}
                        generatingAnalysisTypes={generatingAnalysisTypes}
                        onGenerateAnalysis={handleGenerateAnalysis}
                        onGenerateAllAnalysis={handleGenerateAllAnalysis}
                        onSelectAnalysisView={handleSelectAnalysisView}
                        currentAnalysisView={currentAnalysisView}
                        isEditMode={isEditMode}
                        onToggleEditMode={handleToggleEditMode}
                        hasEditedSegments={getEditedSegments().length > 0}
                        onRevertAll={handleRevertAll}
                        isReverting={isReverting}
                    />
                }
                audioPlayer={
                    <AudioPlayer
                        currentTime={currentTime}
                        duration={duration}
                        isPlaying={isPlaying}
                        onPlayPause={toggle}
                        onSeek={seekTo}
                        onSkipBack={handleSkipBack}
                        onSkipForward={handleSkipForward}
                        disabled={!data.audioUrl}
                    />
                }
            >
                {/* Header */}
                <ViewerHeader
                    data={data}
                    onToggleSidebar={() => setIsSidebarOpen(true)}
                    currentAnalysisView={currentAnalysisView}
                />

                {/* Content: Transcript or Analysis View */}
                {currentAnalysisView === "ActionItems" ? (
                    <ActionItemsView
                        actionItemsAnalysis={getAnalysisByType("ActionItems")}
                        displayLanguage={displayLanguage}
                    />
                ) : currentAnalysisView === "MeetingMinutes" ? (
                    <MeetingMinutesView
                        minutesAnalysis={getAnalysisByType("MeetingMinutes")}
                        displayLanguage={displayLanguage}
                    />
                ) : ["ShortSummary", "LongSummary", "Topics", "Sentiment"].includes(currentAnalysisView) ? (
                    <AnalysisContentView
                        analysis={getAnalysisByType(currentAnalysisView as AnalysisType)}
                        analysisType={currentAnalysisView}
                        displayLanguage={displayLanguage}
                    />
                ) : (
                    <TranscriptContent
                        segments={data.segments}
                        speakers={data.speakers}
                        activeSegmentIndex={activeSegmentIndex}
                        showTimecodes={showTimecodes}
                        showSpeakers={showSpeakers}
                        displayLanguage={displayLanguage}
                        onSegmentClick={seekToSegment}
                        isEditMode={isEditMode}
                        onEditClick={handleSegmentEditClick}
                    />
                )}
            </ViewerLayout>

            {/* Segment Edit Modal */}
            <SegmentEditModal
                segment={editingSegment}
                onClose={() => setEditingSegment(null)}
                onSave={handleSaveEdit}
                onRevert={handleRevertEdit}
                isSaving={isUpdating}
                isReverting={isReverting}
            />
        </div>
    );
}
