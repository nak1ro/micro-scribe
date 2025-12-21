"use client";

import * as React from "react";
import type { ViewerSegment } from "./types";

interface UseAudioSyncOptions {
    segments: ViewerSegment[];
    audioUrl: string | null;
}

interface UseAudioSyncReturn {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    activeSegmentIndex: number;
    play: () => void;
    pause: () => void;
    toggle: () => void;
    seekTo: (time: number) => void;
    seekToSegment: (index: number) => void;
    setActiveSegmentIndex: (index: number) => void;
}

export function useAudioSync({ segments, audioUrl }: UseAudioSyncOptions): UseAudioSyncReturn {
    const audioRef = React.useRef<HTMLAudioElement>(null);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [activeSegmentIndex, setActiveSegmentIndex] = React.useState(0);
    const isSeekingRef = React.useRef(false);

    // Find segment index for a given time
    const findSegmentIndexAtTime = React.useCallback((time: number): number => {
        for (let i = 0; i < segments.length; i++) {
            if (time >= segments[i].startSeconds && time <= segments[i].endSeconds) {
                return i;
            }
        }
        // If past all segments, return last
        if (segments.length > 0 && time > segments[segments.length - 1].endSeconds) {
            return segments.length - 1;
        }
        return 0;
    }, [segments]);

    // Handle audio time update
    const handleTimeUpdate = React.useCallback(() => {
        if (!audioRef.current) return;
        const time = audioRef.current.currentTime;
        setCurrentTime(time);

        // Skip segment update if manually seeking
        if (isSeekingRef.current) return;

        const newIndex = findSegmentIndexAtTime(time);
        if (newIndex !== activeSegmentIndex) {
            setActiveSegmentIndex(newIndex);
        }
    }, [findSegmentIndexAtTime, activeSegmentIndex]);

    // Set up audio event listeners
    React.useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onLoadedMetadata = () => setDuration(audio.duration);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => setIsPlaying(false);
        const onSeeked = () => { isSeekingRef.current = false; };

        audio.addEventListener("loadedmetadata", onLoadedMetadata);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("seeked", onSeeked);

        return () => {
            audio.removeEventListener("loadedmetadata", onLoadedMetadata);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("seeked", onSeeked);
        };
    }, [handleTimeUpdate]);

    // Calculate duration from segments if no audio
    React.useEffect(() => {
        if (!audioUrl && segments.length > 0) {
            const lastSegment = segments[segments.length - 1];
            setDuration(lastSegment.endSeconds);
        }
    }, [audioUrl, segments]);

    const play = React.useCallback(() => {
        audioRef.current?.play();
    }, []);

    const pause = React.useCallback(() => {
        audioRef.current?.pause();
    }, []);

    const toggle = React.useCallback(() => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }, [isPlaying, play, pause]);

    const seekTo = React.useCallback((time: number) => {
        if (audioRef.current) {
            isSeekingRef.current = true;
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    }, []);

    const seekToSegment = React.useCallback((index: number) => {
        if (segments[index]) {
            setActiveSegmentIndex(index);
            seekTo(segments[index].startSeconds);
        }
    }, [segments, seekTo]);

    return {
        audioRef,
        currentTime,
        duration,
        isPlaying,
        activeSegmentIndex,
        play,
        pause,
        toggle,
        seekTo,
        seekToSegment,
        setActiveSegmentIndex,
    };
}
