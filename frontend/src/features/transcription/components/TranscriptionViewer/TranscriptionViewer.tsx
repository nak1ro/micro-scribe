"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranscriptionJob } from "@/hooks/useTranscriptions";
import { TranscriptionJobStatus } from "@/types/api/transcription";

// Local components
import { TimelineSlider } from "./TimelineSlider";
import { TranscriptionDetailLayout } from "./TranscriptionDetailLayout";
import { TranscriptionViewerHeader } from "./TranscriptionViewerHeader";
import { useScrollDirection } from "./useScrollDirection";
import { formatTimestamp } from "./utils";

interface TranscriptionViewerProps {
    jobId: string;
}

export function TranscriptionViewer({ jobId }: TranscriptionViewerProps) {
    const router = useRouter();
    const { data: job, isLoading, error } = useTranscriptionJob(jobId);
    const [copied, setCopied] = React.useState(false);
    const [showTimecodes, setShowTimecodes] = React.useState(true);
    const [activeSegmentIndex, setActiveSegmentIndex] = React.useState(0);
    const [isPlaying, setIsPlaying] = React.useState(false);

    // Refs for scrolling and audio
    const segmentRefs = React.useRef<Map<number, HTMLSpanElement>>(new Map());
    const audioRef = React.useRef<HTMLAudioElement>(null);
    const isSeekingRef = React.useRef(false);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // Header visibility based on scroll direction
    const isHeaderVisible = useScrollDirection({ threshold: 40, containerRef: scrollContainerRef });

    const segments = job?.segments || [];
    const totalDuration = job?.durationSeconds || (segments.length > 0 ? segments[segments.length - 1].endSeconds : 0);

    // Scroll to active segment when it changes
    React.useEffect(() => {
        if (segments.length === 0) return;
        const ref = segmentRefs.current.get(activeSegmentIndex);
        ref?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [activeSegmentIndex, segments.length]);

    // Find segment index for a given time
    const findSegmentIndexAtTime = React.useCallback((time: number): number => {
        for (let i = 0; i < segments.length; i++) {
            if (time >= segments[i].startSeconds && time <= segments[i].endSeconds) {
                return i;
            }
        }
        // If past all segments, return last; if before, return first
        if (segments.length > 0 && time > segments[segments.length - 1].endSeconds) {
            return segments.length - 1;
        }
        return 0;
    }, [segments]);

    const handleCopy = async () => {
        if (!job?.transcript) return;
        await navigator.clipboard.writeText(job.transcript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleBack = () => {
        router.push("/dashboard");
    };

    // Handle slider change - seek audio to segment start
    const handleSliderChange = (index: number) => {
        setActiveSegmentIndex(index);
        if (audioRef.current && segments[index]) {
            isSeekingRef.current = true;
            audioRef.current.currentTime = segments[index].startSeconds;
        }
    };

    // Handle segment click - seek audio to segment start
    const handleSegmentClick = (index: number) => {
        setActiveSegmentIndex(index);
        if (audioRef.current && segments[index]) {
            isSeekingRef.current = true;
            audioRef.current.currentTime = segments[index].startSeconds;
        }
    };

    // Handle audio time update - sync timeline with playback
    const handleTimeUpdate = () => {
        if (!audioRef.current || segments.length === 0) return;
        // Skip if we're in the middle of a manual seek
        if (isSeekingRef.current) return;
        const currentTime = audioRef.current.currentTime;
        const newIndex = findSegmentIndexAtTime(currentTime);
        if (newIndex !== activeSegmentIndex) {
            setActiveSegmentIndex(newIndex);
        }
    };

    // Re-enable time tracking after seek completes
    const handleSeeked = () => {
        isSeekingRef.current = false;
    };

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleDownload = () => {
        if (!job?.presignedUrl) return;
        const link = document.createElement("a");
        link.href = job.presignedUrl;
        link.download = job.originalFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground">Loading transcription...</p>
            </div>
        );
    }

    // Error state
    if (error || !job) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="text-center">
                    <p className="font-semibold text-foreground mb-1">Failed to load transcription</p>
                    <p className="text-sm text-muted-foreground">{error?.message || "Unknown error"}</p>
                </div>
                <Button variant="ghost" onClick={handleBack}>
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    const isCompleted = job.status === TranscriptionJobStatus.Completed;
    const isPending = job.status === TranscriptionJobStatus.Pending || job.status === TranscriptionJobStatus.Processing;

    return (
        <TranscriptionDetailLayout
            showSidebar={isCompleted}
            scrollContainerRef={scrollContainerRef}
            onCopyTranscript={handleCopy}
            isCopied={copied}
            showTimecodes={showTimecodes}
            onToggleTimecodes={setShowTimecodes}
            onDownloadAudio={handleDownload}
            hasTranscript={!!job.transcript}
            hasAudioUrl={!!job.presignedUrl}
            hasSegments={segments.length > 0}
        >
            <div className="animate-fade-in h-full flex flex-col">
                {/* Hidden audio element */}
                {job.presignedUrl && (
                    <audio
                        ref={audioRef}
                        src={job.presignedUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onSeeked={handleSeeked}
                        onEnded={() => setIsPlaying(false)}
                        onPause={() => setIsPlaying(false)}
                        onPlay={() => setIsPlaying(true)}
                        className="hidden"
                        aria-label="Transcription audio"
                    />
                )}

                {/* Header - hides on scroll down, shows on scroll up */}
                <TranscriptionViewerHeader
                    fileName={job.originalFileName}
                    status={job.status}
                    durationSeconds={job.durationSeconds ?? undefined}
                    languageCode={job.languageCode ?? undefined}
                    onBack={handleBack}
                    isVisible={isHeaderVisible}
                />

                {/* Pending/Processing state */}
                {isPending && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4 bg-card border border-border rounded-xl">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <div className="text-center">
                            <p className="font-semibold text-foreground mb-1">Transcription in progress</p>
                            <p className="text-sm text-muted-foreground">
                                This may take a few minutes depending on the file length.
                            </p>
                        </div>
                    </div>
                )}

                {/* Failed state */}
                {job.status === TranscriptionJobStatus.Failed && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4 bg-destructive/5 border border-destructive/20 rounded-xl">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                        <div className="text-center">
                            <p className="font-semibold text-foreground mb-1">Transcription failed</p>
                            <p className="text-sm text-muted-foreground">
                                {job.errorMessage || "An error occurred during transcription."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Completed state with content */}
                {isCompleted && (
                    <div className="flex flex-col flex-1 min-h-0">
                        {/* Transcript Content */}
                        <div className="flex-1">
                            <div className="bg-card">
                                {segments.length > 0 ? (
                                    <div className="text-foreground leading-relaxed">
                                        {segments.map((segment, index) => (
                                            <span
                                                key={segment.id}
                                                ref={(el) => {
                                                    if (el) segmentRefs.current.set(index, el);
                                                }}
                                                onClick={() => handleSegmentClick(index)}
                                                className={cn(
                                                    "cursor-pointer transition-colors duration-200 rounded px-0.5",
                                                    "hover:bg-highlight-hover",
                                                    index === activeSegmentIndex && "bg-highlight"
                                                )}
                                            >
                                                {showTimecodes && (
                                                    <span className="text-primary font-medium">
                                                        ({formatTimestamp(segment.startSeconds)})
                                                    </span>
                                                )}{" "}
                                                {segment.text}{" "}
                                            </span>
                                        ))}
                                    </div>
                                ) : job.transcript ? (
                                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                                        {job.transcript}
                                    </p>
                                ) : (
                                    <p className="text-muted-foreground italic">No transcript available.</p>
                                )}
                            </div>
                        </div>

                        {/* Timeline Slider - Sticky at bottom */}
                        {segments.length > 0 && (
                            <div className="sticky bottom-0 pt-4 pb-2 bg-background z-10">
                                <TimelineSlider
                                    segments={segments}
                                    totalDuration={totalDuration}
                                    activeIndex={activeSegmentIndex}
                                    onChange={handleSliderChange}
                                    isPlaying={isPlaying}
                                    onPlayPause={job.presignedUrl ? handlePlayPause : undefined}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </TranscriptionDetailLayout>
    );
}
