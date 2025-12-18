"use client";

import * as React from "react";
import { Mic, Trash2 } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

interface VoiceRecordingTabProps {
    audioBlob: Blob | null;
    onRecordingComplete: (blob: Blob) => void;
    onClear: () => void;
}

export function VoiceRecordingTab({ audioBlob, onRecordingComplete, onClear }: VoiceRecordingTabProps) {
    const [isRecording, setIsRecording] = React.useState(false);
    const [recordingTime, setRecordingTime] = React.useState(0);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const chunksRef = React.useRef<Blob[]>([]);
    const timerRef = React.useRef<number | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                onRecordingComplete(blob);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = window.setInterval(() => {
                setRecordingTime((t) => t + 1);
            }, 1000);
        } catch (err) {
            console.error("Failed to start recording:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mic className="h-5 w-5 text-primary" />
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
                        <Trash2 className="h-5 w-5" />
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
                <Mic className="h-10 w-10" />
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
