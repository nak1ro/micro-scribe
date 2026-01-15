"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Play, Pause, SkipPrev, SkipNext, SoundHigh } from "iconoir-react";
import { Button } from "@/components/ui";
import { formatTime } from "@/lib/utils";
import { useAudioProgress } from "@/features/transcription/hooks/useAudioProgress";

interface AudioPlayerProps {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    onPlayPause: () => void;
    onSeek: (time: number) => void;
    onSkipBack?: () => void;
    onSkipForward?: () => void;
    disabled?: boolean;
    className?: string;
}

export function AudioPlayer({
    currentTime,
    duration,
    isPlaying,
    onPlayPause,
    onSeek,
    onSkipBack,
    onSkipForward,
    disabled = false,
    className,
}: AudioPlayerProps) {
    const { progressRef, isDragging, progress, handlers } = useAudioProgress({
        currentTime,
        duration,
        disabled,
        onSeek,
    });

    return (
        <div
            className={cn(
                "flex flex-col gap-3 px-4 py-3 md:px-6 md:py-4",
                "bg-background/80 backdrop-blur-md",
                className
            )}
        >
            {/* Progress bar */}
            <div className="flex items-center gap-3">
                {/* Current time */}
                <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                    {formatTime(currentTime)}
                </span>

                {/* Progress track */}
                <div
                    ref={progressRef}
                    className={cn(
                        "flex-1 h-2 rounded-full bg-muted cursor-pointer relative group",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                    {...handlers}
                    role="slider"
                    aria-label="Audio progress"
                    aria-valuemin={0}
                    aria-valuemax={duration}
                    aria-valuenow={currentTime}
                    tabIndex={disabled ? -1 : 0}
                >
                    {/* Progress fill */}
                    <div
                        className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-75"
                        style={{ width: `${progress}%` }}
                    />

                    {/* Thumb */}
                    <div
                        className={cn(
                            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
                            "w-4 h-4 rounded-full bg-primary shadow-md",
                            "opacity-0 group-hover:opacity-100 transition-opacity",
                            isDragging && "opacity-100 scale-110"
                        )}
                        style={{ left: `${progress}%` }}
                    />
                </div>

                {/* Duration */}
                <span className="text-xs font-mono text-muted-foreground w-12">
                    {formatTime(duration)}
                </span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2">
                {/* Skip back */}
                {onSkipBack && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSkipBack}
                        disabled={disabled}
                        className="h-9 w-9 p-0 rounded-full"
                        aria-label="Skip back 10 seconds"
                    >
                        <SkipPrev className="h-4 w-4" />
                    </Button>
                )}

                {/* Play/Pause */}
                <Button
                    variant="default"
                    size="sm"
                    onClick={onPlayPause}
                    disabled={disabled}
                    className={cn(
                        "h-12 w-12 p-0 rounded-full",
                        "bg-primary hover:bg-primary/90",
                        "text-primary-foreground",
                        "shadow-lg hover:shadow-xl transition-shadow"
                    )}
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? (
                        <Pause className="h-5 w-5" />
                    ) : (
                        <Play className="h-5 w-5 ml-0.5" />
                    )}
                </Button>

                {/* Skip forward */}
                {onSkipForward && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSkipForward}
                        disabled={disabled}
                        className="h-9 w-9 p-0 rounded-full"
                        aria-label="Skip forward 10 seconds"
                    >
                        <SkipNext className="h-4 w-4" />
                    </Button>
                )}

                {/* Volume indicator (visual only for now) */}
                <div className="hidden md:flex items-center gap-2 ml-4 text-muted-foreground">
                    <SoundHigh className="h-4 w-4" />
                </div>
            </div>
        </div>
    );
}
