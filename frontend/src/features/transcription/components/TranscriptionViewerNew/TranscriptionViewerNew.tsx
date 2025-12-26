"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { RefreshDouble, WarningCircle } from "iconoir-react";
import { Button } from "@/components/ui";
import { useTranscriptionJob } from "@/hooks/useTranscriptions";
import { useAnalysis } from "@/hooks/useAnalysis";

import { ViewerHeader } from "./ViewerHeader";
import { ViewerLayout } from "./ViewerLayout";
import { TranscriptContent } from "./TranscriptContent";
import { AudioPlayer } from "./AudioPlayer";
import { ActionsSidebar } from "./ActionsSidebar";
import { ActionItemsView } from "./ActionItemsView";
import { MeetingMinutesView } from "./MeetingMinutesView";
import { AnalysisContentView } from "./AnalysisContentView";
import { useAudioSync } from "@/features/transcription/hooks/useAudioSync";
import { handleExport as exportFile } from "@/features/transcription/utils/exportUtils";
import { getProcessingStepText } from "@/features/transcription/utils";
import { transcriptionApi } from "@/services/transcription";
import type { TranscriptionData, ExportFormat } from "@/features/transcription/types";
import type { AnalysisType } from "@/types/api/analysis";

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
                    isEdited: s.isEdited
                })),
                audioUrl: job.presignedUrl
            };
        }

        return undefined;
    }, [providedData, job]);

    // UI State
    const [showTimecodes, setShowTimecodes] = React.useState(true);
    const [showSpeakers, setShowSpeakers] = React.useState(true);
    const [copied, setCopied] = React.useState(false);
    const [displayLanguage, setDisplayLanguage] = React.useState<string | null>(null);

    // Track the language being translated to auto-switch when complete
    const prevTranslatingRef = React.useRef<string | null>(null);

    // Analysis hook (placed before translation effect so refetch is available)
    const {
        analyses,
        isGenerating: isAnalysisGenerating,
        generatingTypes: generatingAnalysisTypes,
        generate: generateAnalysis,
        generateAll: generateAllAnalysis,
        getAnalysisByType,
        refetch: refetchAnalysis,
    } = useAnalysis({ jobId: jobId || "", enabled: !!jobId && data?.status === "completed" });

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

    // Active analysis view state ("transcript" or AnalysisType)
    const [currentAnalysisView, setCurrentAnalysisView] = React.useState<string>("transcript");

    // Handler to switch analysis view
    const handleSelectAnalysisView = (view: "transcript" | AnalysisType) => {
        console.log("[TranscriptionViewerNew] Switching to view:", view);
        setCurrentAnalysisView(view);
    };

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

        try {
            // Export in the currently displayed language
            await exportFile(format, data, displayLanguage);
        } catch (error) {
            console.error("Export failed:", error);
            // TODO: Add toast notification here
        }
    };

    const handleEdit = () => {
        // Placeholder for edit mode
        console.log("Edit mode - coming soon");
    };

    const handleSkipBack = () => {
        seekTo(Math.max(0, currentTime - 10));
    };

    const handleSkipForward = () => {
        seekTo(Math.min(duration, currentTime + 10));
    };

    const handleTranslate = async (targetLanguage: string) => {
        if (!data?.id) return;
        try {
            await transcriptionApi.translateJob(data.id, targetLanguage);
            // Immediately refetch to pick up the new translationStatus and start polling
            await refetch();
        } catch (error: unknown) {
            // Extract useful error info from Axios errors
            const axiosError = error as { response?: { data?: { detail?: string; message?: string }; status?: number } };
            const message = axiosError.response?.data?.detail
                || axiosError.response?.data?.message
                || `Request failed with status ${axiosError.response?.status}`;
            console.error("Failed to start translation:", message, error);
        }
    };

    // Loading state - skeleton UI
    if (isLoading && !providedData) {
        return (
            <div className="flex flex-col h-screen bg-background">
                {/* Header skeleton */}
                <div className="h-16 border-b border-border px-6 flex items-center gap-4">
                    <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
                    <div className="h-5 w-48 rounded bg-muted animate-pulse" />
                </div>

                {/* Content skeleton */}
                <div className="flex-1 p-6 md:p-8 space-y-6 overflow-hidden">
                    {/* Transcript text skeleton lines */}
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            {/* Timestamp + speaker skeleton */}
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                            </div>
                            {/* Text lines skeleton - deterministic widths to avoid hydration mismatch */}
                            <div className="space-y-2 pl-0">
                                <div
                                    className="h-4 rounded bg-muted animate-pulse"
                                    style={{ width: `${70 + ((i * 13) % 25)}%` }}
                                />
                                <div
                                    className="h-4 rounded bg-muted animate-pulse"
                                    style={{ width: `${50 + ((i * 17) % 40)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Audio player skeleton */}
                <div className="h-24 border-t border-border px-6 flex items-center gap-4">
                    <div className="h-4 w-12 rounded bg-muted animate-pulse" />
                    <div className="flex-1 h-2 rounded-full bg-muted animate-pulse" />
                    <div className="h-4 w-12 rounded bg-muted animate-pulse" />
                </div>
            </div>
        );
    }

    // Error state
    if (error && !providedData && !data) {
        return (
            <div className="flex flex-col h-screen bg-background items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <WarningCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="text-center">
                    <p className="font-semibold text-foreground mb-1">Failed to load transcription</p>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                </div>
                <Button variant="ghost" onClick={handleBack}>
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    if (!data) {
        return null; // Should not happen given logic above
    }

    // Pending/Processing state
    if (data.status === "pending" || data.status === "processing") {
        const stepText = getProcessingStepText(data.status, data.processingStep);
        return (
            <div className="flex flex-col h-screen bg-background">
                <ViewerHeader data={data} onBack={handleBack} />
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                    <RefreshDouble className="h-10 w-10 text-primary animate-spin" />
                    <div className="text-center">
                        <p className="font-semibold text-foreground mb-1">
                            {stepText}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            This may take a few minutes depending on the file length.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Failed state
    if (data.status === "failed") {
        return (
            <div className="flex flex-col h-screen bg-background">
                <ViewerHeader data={data} onBack={handleBack} />
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <WarningCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-foreground mb-1">
                            Transcription failed
                        </p>
                        <p className="text-sm text-muted-foreground">
                            An error occurred during transcription.
                        </p>
                    </div>
                    <Button variant="ghost" onClick={handleBack}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    // Completed state - full viewer
    return (
        <div className={cn("h-full", className)}>
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
                        sourceLanguage={data.sourceLanguage}
                        displayLanguage={displayLanguage}
                        onDisplayLanguageChange={setDisplayLanguage}
                        analyses={analyses}
                        isAnalysisGenerating={isAnalysisGenerating}
                        generatingAnalysisTypes={generatingAnalysisTypes}
                        onGenerateAnalysis={generateAnalysis}
                        onGenerateAllAnalysis={generateAllAnalysis}
                        onSelectAnalysisView={handleSelectAnalysisView}
                        currentAnalysisView={currentAnalysisView}
                        onEdit={handleEdit}
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
                <ViewerHeader data={data} onBack={handleBack} />

                {/* Content: Transcript or Analysis View */}
                {currentAnalysisView === "ActionItems" ? (
                    <ActionItemsView
                        actionItemsAnalysis={getAnalysisByType("ActionItems")}
                        displayLanguage={displayLanguage}
                        onBack={() => setCurrentAnalysisView("transcript")}
                    />
                ) : currentAnalysisView === "MeetingMinutes" ? (
                    <MeetingMinutesView
                        minutesAnalysis={getAnalysisByType("MeetingMinutes")}
                        displayLanguage={displayLanguage}
                        onBack={() => setCurrentAnalysisView("transcript")}
                    />
                ) : ["ShortSummary", "LongSummary", "Topics", "Sentiment"].includes(currentAnalysisView) ? (
                    <AnalysisContentView
                        analysis={getAnalysisByType(currentAnalysisView as AnalysisType)}
                        analysisType={currentAnalysisView}
                        displayLanguage={displayLanguage}
                        onBack={() => setCurrentAnalysisView("transcript")}
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
                    />
                )}
            </ViewerLayout>
        </div>
    );
}
