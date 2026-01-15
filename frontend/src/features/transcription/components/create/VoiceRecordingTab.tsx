"use client";

import * as React from "react";
import { Microphone, Trash } from "iconoir-react";
import { cn, formatFileSize } from "@/lib/utils";
import { useVoiceRecorder } from "@/features/transcription/hooks/useVoiceRecorder";

interface VoiceRecordingTabProps {
    audioBlob: Blob | null;
    onRecordingComplete: (blob: Blob) => void;
    onClear: () => void;
}

export function VoiceRecordingTab({ audioBlob, onRecordingComplete, onClear }: VoiceRecordingTabProps) {
    const {
        isRecording,
        recordingTime,
        startRecording,
        stopRecording,
        formatTime
    } = useVoiceRecorder({ onRecordingComplete });

    if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Microphone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-foreground">Voice Recording</p>
                        <p className="text-sm text-muted-foreground">
                            {formatFileSize(audioBlob.size)}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClear}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors relative z-10"
                        title="Delete recording"
                        aria-label="Delete recording"
                    >
                        <Trash className="h-5 w-5" />
                    </button>
                </div>
                <audio controls src={audioUrl} className="w-full" aria-label="Audio preview" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-12 gap-6">
            <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center transition-all",
                    isRecording
                        ? "bg-destructive text-destructive-foreground animate-pulse"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                )}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
                <Microphone className="h-10 w-10" />
            </button>

            <div className="text-center">
                {isRecording ? (
                    <>
                        <p className="text-lg font-semibold text-destructive">
                            Recording... {formatTime(recordingTime)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Click to stop recording
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-lg font-semibold text-foreground">
                            Press to start recording
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Your microphone will be used
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
