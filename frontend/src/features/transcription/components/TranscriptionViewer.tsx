"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowLeft, Clock, FileText, AlignLeft, Loader2, Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranscriptionJob } from "@/hooks/useTranscriptions";
import { TranscriptionJobStatus } from "@/types/api/transcription";

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

    const handleCopy = async () => {
        if (!job?.transcript) return;
        await navigator.clipboard.writeText(job.transcript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleBack = () => {
        router.push("/dashboard");
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
        <div className="max-w-4xl mx-auto animate-fade-in">
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
                            label={`Segments (${job.segments?.length || 0})`}
                        />
                    </div>

                    {/* Tab Content */}
                    {activeTab === "full-text" && (
                        <div className="bg-card border border-border rounded-xl p-6">
                            {job.transcript ? (
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
                            {job.segments && job.segments.length > 0 ? (
                                job.segments.map((segment) => (
                                    <SegmentCard key={segment.id} segment={segment} />
                                ))
                            ) : (
                                <div className="bg-card border border-border rounded-xl p-6 text-center">
                                    <p className="text-muted-foreground italic">No segments available.</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
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
    segment: {
        id: string;
        text: string;
        startSeconds: number;
        endSeconds: number;
        speaker: string | null;
        isEdited: boolean;
    };
}

function SegmentCard({ segment }: SegmentCardProps) {
    return (
        <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
                {/* Timestamp */}
                <div className="flex-shrink-0 text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
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
