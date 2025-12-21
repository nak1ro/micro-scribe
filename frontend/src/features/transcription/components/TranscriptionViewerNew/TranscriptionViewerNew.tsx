"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranscriptionJob } from "@/hooks/useTranscriptions";

import { ViewerHeader } from "./ViewerHeader";
import { ViewerLayout } from "./ViewerLayout";
import { TranscriptContent } from "./TranscriptContent";
import { AudioPlayer } from "./AudioPlayer";
import { ActionsSidebar } from "./ActionsSidebar";
import { useAudioSync } from "@/features/transcription/hooks/useAudioSync";
import type { TranscriptionData, ExportFormat } from "@/features/transcription/types";

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
    const { data: job, isLoading, error } = useTranscriptionJob(jobId || "");

    // Use provided data, mapped job data, or mock data (only as fallback if no jobId/data)
    const data: TranscriptionData | undefined = React.useMemo(() => {
        if (providedData) return providedData;

        if (job) {
            return {
                id: job.jobId,
                fileName: job.originalFileName,
                status: job.status.toLowerCase() as TranscriptionData["status"],
                durationSeconds: job.durationSeconds || 0,
                languageCode: job.languageCode || "en",
                segments: job.segments.map((s: any) => ({
                    id: s.id,
                    text: s.text,
                    startSeconds: s.startSeconds,
                    endSeconds: s.endSeconds,
                    speaker: s.speaker,
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
        const text = data.segments.map(seg => seg.text).join(" ");
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExport = (format: ExportFormat) => {
        if (!data) return;

        // Placeholder - will be implemented later
        console.log(`Export as ${format}`);

        if (format === "mp3" && data.audioUrl) {
            // Download original audio
            const link = document.createElement("a");
            link.href = data.audioUrl;
            link.download = data.fileName.replace(/\.[^/.]+$/, ".mp3");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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

    // Loading state
    if (isLoading && !providedData) {
        return (
            <div className="flex flex-col h-screen bg-background items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground">Loading transcription...</p>
            </div>
        );
    }

    // Error state
    if (error && !providedData && !data) {
        return (
            <div className="flex flex-col h-screen bg-background items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-destructive" />
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
        return (
            <div className="flex flex-col h-screen bg-background">
                <ViewerHeader data={data} onBack={handleBack} />
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <div className="text-center">
                        <p className="font-semibold text-foreground mb-1">
                            Transcription in progress
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
                        <AlertCircle className="h-8 w-8 text-destructive" />
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
        <div className={cn("h-screen", className)}>
            {/* Hidden audio element */}
            {data.audioUrl && (
                <audio
                    ref={audioRef}
                    src={data.audioUrl}
                    className="hidden"
                    aria-label="Transcription audio"
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

                {/* Transcript content */}
                <TranscriptContent
                    segments={data.segments}
                    activeSegmentIndex={activeSegmentIndex}
                    showTimecodes={showTimecodes}
                    showSpeakers={showSpeakers}
                    onSegmentClick={seekToSegment}
                />
            </ViewerLayout>
        </div>
    );
}
