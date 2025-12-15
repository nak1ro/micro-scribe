"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowLeft, Clock, FileText, AlignLeft, Loader2, Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranscriptionJob } from "@/hooks/useTranscriptions";
import { TranscriptionJobStatus } from "@/types/api/transcription";
import type { TranscriptSegmentDto } from "@/types/api/transcription";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type TabType = "full-text" | "segments";

interface TranscriptionViewerProps {
    jobId: string;
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export function TranscriptionViewer({ jobId }: TranscriptionViewerProps) {
    const router = useRouter();
    const { data: job, isLoading, error } = useTranscriptionJob(jobId);
    const [activeTab, setActiveTab] = React.useState<TabType>("full-text");
    const [copied, setCopied] = React.useState(false);
    const [activeSegmentIndex, setActiveSegmentIndex] = React.useState(0);

    // Refs for scrolling
    const segmentRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());
    const fullTextSpanRefs = React.useRef<Map<number, HTMLSpanElement>>(new Map());
    const fullTextRef = React.useRef<HTMLDivElement>(null);

    const segments = job?.segments || [];
    const totalDuration = job?.durationSeconds || (segments.length > 0 ? segments[segments.length - 1].endSeconds : 0);

    // Scroll to active segment when it changes
    React.useEffect(() => {
        if (segments.length === 0) return;

        if (activeTab === "segments") {
            const ref = segmentRefs.current.get(activeSegmentIndex);
            ref?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (activeTab === "full-text") {
            const ref = fullTextSpanRefs.current.get(activeSegmentIndex);
            ref?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [activeSegmentIndex, activeTab, segments.length]);

    const handleCopy = async () => {
        if (!job?.transcript) return;
        await navigator.clipboard.writeText(job.transcript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleBack = () => {
        router.push("/dashboard");
    };

    const handleSliderChange = (index: number) => {
        setActiveSegmentIndex(index);
    };

    const handleSegmentClick = (index: number) => {
        setActiveSegmentIndex(index);
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
        <div className="max-w-4xl mx-auto animate-fade-in pb-24">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm">Back to Dashboard</span>
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">
                            {job.originalFileName}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <StatusBadge status={job.status} />
                            {job.durationSeconds && (
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {formatDuration(job.durationSeconds)}
                                </span>
                            )}
                            {job.languageCode && (
                                <span className="uppercase">{job.languageCode}</span>
                            )}
                        </div>
                    </div>

                    {isCompleted && job.transcript && (
                        <Button
                            variant="outline"
                            onClick={handleCopy}
                            className="gap-2"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4 text-success" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" />
                                    Copy Text
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

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
                <>
                    {/* Tabs */}
                    <div className="flex border-b border-border mb-6">
                        <TabButton
                            active={activeTab === "full-text"}
                            onClick={() => setActiveTab("full-text")}
                            icon={FileText}
                            label="Full Text"
                        />
                        <TabButton
                            active={activeTab === "segments"}
                            onClick={() => setActiveTab("segments")}
                            icon={AlignLeft}
                            label={`Segments (${segments.length})`}
                        />
                    </div>

                    {/* Tab Content */}
                    {activeTab === "full-text" && (
                        <div ref={fullTextRef} className="bg-card border border-border rounded-xl p-6">
                            {segments.length > 0 ? (
                                <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                                    {segments.map((segment, index) => (
                                        <span
                                            key={segment.id}
                                            ref={(el) => {
                                                if (el) fullTextSpanRefs.current.set(index, el);
                                            }}
                                            onClick={() => handleSegmentClick(index)}
                                            className={cn(
                                                "transition-colors duration-200 cursor-pointer hover:bg-primary/10 rounded",
                                                index === activeSegmentIndex && "bg-primary/20 rounded px-0.5"
                                            )}
                                        >
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
                    )}

                    {activeTab === "segments" && (
                        <div className="space-y-3">
                            {segments.length > 0 ? (
                                segments.map((segment, index) => (
                                    <SegmentCard
                                        key={segment.id}
                                        segment={segment}
                                        isActive={index === activeSegmentIndex}
                                        onClick={() => handleSegmentClick(index)}
                                        ref={(el) => {
                                            if (el) segmentRefs.current.set(index, el);
                                        }}
                                    />
                                ))
                            ) : (
                                <div className="bg-card border border-border rounded-xl p-6 text-center">
                                    <p className="text-muted-foreground italic">No segments available.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Timeline Slider - Fixed at bottom */}
                    {segments.length > 0 && (
                        <TimelineSlider
                            segments={segments}
                            totalDuration={totalDuration}
                            activeIndex={activeSegmentIndex}
                            onChange={handleSliderChange}
                        />
                    )}
                </>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Timeline Slider
// ─────────────────────────────────────────────────────────────

interface TimelineSliderProps {
    segments: TranscriptSegmentDto[];
    totalDuration: number;
    activeIndex: number;
    onChange: (index: number) => void;
}

function TimelineSlider({ segments, totalDuration, activeIndex, onChange }: TimelineSliderProps) {
    const sliderRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const getIndexFromPosition = (clientX: number) => {
        if (!sliderRef.current || segments.length === 0) return 0;
        const rect = sliderRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const ratio = x / rect.width;
        const targetTime = ratio * totalDuration;

        // Find the segment that contains this time
        for (let i = 0; i < segments.length; i++) {
            if (targetTime <= segments[i].endSeconds) {
                return i;
            }
        }
        return segments.length - 1;
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        const index = getIndexFromPosition(e.clientX);
        onChange(index);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const index = getIndexFromPosition(e.clientX);
        onChange(index);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    React.useEffect(() => {
        if (isDragging) {
            const handleGlobalMouseUp = () => setIsDragging(false);
            window.addEventListener("mouseup", handleGlobalMouseUp);
            return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
        }
    }, [isDragging]);

    // Calculate thumb position
    const activeSegment = segments[activeIndex];
    const thumbPosition = activeSegment
        ? ((activeSegment.startSeconds + activeSegment.endSeconds) / 2) / totalDuration * 100
        : 0;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 z-50">
            <div className="max-w-4xl mx-auto">
                {/* Current segment preview */}
                <div className="text-center mb-3">
                    <p className="text-sm text-muted-foreground">
                        Segment {activeIndex + 1} of {segments.length}
                    </p>
                    <p className="text-xs text-muted-foreground/70 truncate max-w-md mx-auto">
                        {activeSegment?.text.slice(0, 80)}...
                    </p>
                </div>

                {/* Slider track */}
                <div
                    ref={sliderRef}
                    className="relative h-2 bg-muted rounded-full cursor-pointer select-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >
                    {/* Segment markers */}
                    {segments.map((segment, index) => {
                        const position = (segment.startSeconds / totalDuration) * 100;
                        return (
                            <div
                                key={segment.id}
                                className={cn(
                                    "absolute top-0 bottom-0 w-0.5",
                                    index === activeIndex ? "bg-primary" : "bg-border"
                                )}
                                style={{ left: `${position}%` }}
                            />
                        );
                    })}

                    {/* Progress fill */}
                    <div
                        className="absolute top-0 left-0 h-full bg-primary/30 rounded-full"
                        style={{ width: `${thumbPosition}%` }}
                    />

                    {/* Thumb */}
                    <div
                        className={cn(
                            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
                            "w-4 h-4 bg-primary rounded-full shadow-lg",
                            "transition-transform",
                            isDragging && "scale-125"
                        )}
                        style={{ left: `${thumbPosition}%` }}
                    />
                </div>

                {/* Time indicators */}
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>{formatTimestamp(activeSegment?.startSeconds || 0)}</span>
                    <span>{formatTimestamp(totalDuration)}</span>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
}

function TabButton({ active, onClick, icon: Icon, label }: TabButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-4 py-3",
                "text-sm font-medium transition-colors",
                "border-b-2 -mb-[2px]",
                active
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/50"
            )}
        >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
        </button>
    );
}

interface StatusBadgeProps {
    status: TranscriptionJobStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
    const config = {
        [TranscriptionJobStatus.Pending]: { label: "Pending", className: "bg-warning/10 text-warning" },
        [TranscriptionJobStatus.Processing]: { label: "Processing", className: "bg-info/10 text-info" },
        [TranscriptionJobStatus.Completed]: { label: "Completed", className: "bg-success/10 text-success" },
        [TranscriptionJobStatus.Failed]: { label: "Failed", className: "bg-destructive/10 text-destructive" },
        [TranscriptionJobStatus.Cancelled]: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
    };

    const { label, className } = config[status] || config[TranscriptionJobStatus.Pending];

    return (
        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", className)}>
            {label}
        </span>
    );
}

interface SegmentCardProps {
    segment: TranscriptSegmentDto;
    isActive: boolean;
    onClick: () => void;
}

const SegmentCard = React.forwardRef<HTMLDivElement, SegmentCardProps>(
    ({ segment, isActive, onClick }, ref) => {
        return (
            <div
                ref={ref}
                onClick={onClick}
                className={cn(
                    "bg-card border rounded-xl p-4 cursor-pointer transition-all",
                    isActive
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/30"
                )}
            >
                <div className="flex items-start gap-4">
                    {/* Timestamp */}
                    <div className={cn(
                        "flex-shrink-0 text-xs font-mono px-2 py-1 rounded",
                        isActive ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground"
                    )}>
                        {formatTimestamp(segment.startSeconds)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {segment.speaker && (
                            <p className="text-sm font-medium text-primary mb-1">
                                {segment.speaker}
                            </p>
                        )}
                        <p className="text-foreground leading-relaxed">
                            {segment.text}
                        </p>
                        {segment.isEdited && (
                            <span className="text-xs text-muted-foreground italic mt-1 inline-block">
                                (edited)
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    }
);
SegmentCard.displayName = "SegmentCard";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins >= 60) {
        const hrs = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return `${hrs}h ${remainingMins}m`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}
