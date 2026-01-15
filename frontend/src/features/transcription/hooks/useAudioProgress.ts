"use client";

import * as React from "react";

interface UseAudioProgressProps {
    currentTime: number;
    duration: number;
    disabled?: boolean;
    onSeek: (time: number) => void;
}

export function useAudioProgress({
    currentTime,
    duration,
    disabled = false,
    onSeek,
}: UseAudioProgressProps) {
    const progressRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    // Calculate progress percentage
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Handle click/drag on progress bar
    const handleProgressInteraction = React.useCallback(
        (clientX: number) => {
            if (!progressRef.current || disabled) return;

            const rect = progressRef.current.getBoundingClientRect();
            // Clamp between 0 and 1
            const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const newTime = percentage * duration;
            onSeek(newTime);
        },
        [duration, onSeek, disabled]
    );

    const handleMouseDown = (e: React.MouseEvent) => {
        if (disabled) return;
        setIsDragging(true);
        handleProgressInteraction(e.clientX);
    };

    const handleMouseMove = React.useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return;
            handleProgressInteraction(e.clientX);
        },
        [isDragging, handleProgressInteraction]
    );

    const handleMouseUp = React.useCallback(() => {
        setIsDragging(false);
    }, []);

    // Global mouse event listeners for drag
    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Touch support
    const handleTouchStart = (e: React.TouchEvent) => {
        if (disabled) return;
        setIsDragging(true);
        handleProgressInteraction(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || disabled) return;
        handleProgressInteraction(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    return {
        progressRef,
        isDragging,
        progress,
        handlers: {
            onMouseDown: handleMouseDown,
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
        },
    };
}
