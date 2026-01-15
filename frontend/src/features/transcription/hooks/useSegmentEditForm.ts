"use client";

import * as React from "react";
import type { ViewerSegment } from "@/features/transcription/types";

interface UseSegmentEditFormProps {
    segment: ViewerSegment | null;
    onSave: (segmentId: string, text: string) => Promise<void>;
    onRevert: (segmentId: string) => Promise<void>;
    onClose: () => void;
}

export function useSegmentEditForm({
    segment,
    onSave,
    onRevert,
    onClose,
}: UseSegmentEditFormProps) {
    const [text, setText] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);

    // Sync text when segment changes
    React.useEffect(() => {
        if (segment) {
            setText(segment.text);
            setError(null);
        }
    }, [segment]);

    const hasChanges = segment ? text.trim() !== segment.text : false;
    const isBlank = text.trim().length === 0;

    const handleSave = async () => {
        if (!segment) return;

        if (isBlank) {
            setError("Text cannot be empty");
            return;
        }

        if (!hasChanges) {
            onClose();
            return;
        }

        try {
            setError(null);
            await onSave(segment.id, text.trim());
            onClose();
        } catch (err) {
            setError("Failed to save changes. Please try again.");
        }
    };

    const handleRevert = async () => {
        if (!segment) return;

        try {
            setError(null);
            await onRevert(segment.id);
            onClose();
        } catch (err) {
            setError("Failed to revert. Please try again.");
        }
    };

    return {
        text,
        setText,
        error,
        setError,
        hasChanges,
        isBlank,
        handleSave,
        handleRevert,
    };
}
