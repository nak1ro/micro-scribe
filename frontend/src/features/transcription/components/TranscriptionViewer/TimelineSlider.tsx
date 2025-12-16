"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui";
import type { TranscriptSegmentDto } from "@/types/api/transcription";
import { formatTimestamp } from "./utils";

interface TimelineSliderProps {
    segments: TranscriptSegmentDto[];
    totalDuration: number;
    activeIndex: number;
    onChange: (index: number) => void;
    isPlaying?: boolean;
    onPlayPause?: () => void;
}

export function TimelineSlider({ segments, totalDuration, activeIndex, onChange, isPlaying, onPlayPause }: TimelineSliderProps) {
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
        <div className="sticky bottom-0 mt-6 z-50">
            <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg">
                {/* Current segment preview */}
                <p className="text-xs text-muted-foreground/70 truncate text-center">
                    {activeSegment?.text.slice(0, 80)}...
                </p>

                {/* Slider row: Play button + track */}
                <div className="flex items-center gap-3 mt-3">
                    {onPlayPause && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={onPlayPause}
                        >
                            {isPlaying ? (
                                <Pause className="h-4 w-4" />
                            ) : (
                                <Play className="h-4 w-4" />
                            )}
                        </Button>
                    )}

                    {/* Slider track */}
                    <div
                        ref={sliderRef}
                        className="flex-1 relative h-2 bg-muted rounded-full cursor-pointer select-none"
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
                </div>

                {/* Time indicators - aligned under track (with left margin for button space) */}
                <div className={cn(
                    "flex justify-between mt-1 text-xs text-muted-foreground",
                    onPlayPause && "ml-11"
                )}>
                    <span>{formatTimestamp(activeSegment?.startSeconds || 0)}</span>
                    <span>{formatTimestamp(totalDuration)}</span>
                </div>
            </div>
        </div>
    );
}
