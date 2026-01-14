"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Xmark, Undo, Check, WarningCircle } from "iconoir-react";
import { Button } from "@/components/ui";
import type { ViewerSegment } from "@/features/transcription/types";

interface SegmentEditModalProps {
    segment: ViewerSegment | null;
    onClose: () => void;
    onSave: (segmentId: string, text: string) => Promise<void>;
    onRevert: (segmentId: string) => Promise<void>;
    isSaving: boolean;
    isReverting: boolean;
}

export function SegmentEditModal({
    segment,
    onClose,
    onSave,
    onRevert,
    isSaving,
    isReverting,
}: SegmentEditModalProps) {
    const [text, setText] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Sync text when segment changes
    React.useEffect(() => {
        if (segment) {
            setText(segment.text);
            setError(null);
            // Focus textarea when modal opens
            setTimeout(() => textareaRef.current?.focus(), 50);
        }
    }, [segment]);

    if (!segment) return null;

    const isEdited = segment.isEdited;
    const originalText = segment.originalText;
    const hasChanges = text.trim() !== segment.text;
    const isBlank = text.trim().length === 0;
    const isLoading = isSaving || isReverting;

    const handleSave = async () => {
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
        try {
            setError(null);
            await onRevert(segment.id);
            onClose();
        } catch (err) {
            setError("Failed to revert. Please try again.");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Ctrl/Cmd + Enter to save
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            handleSave();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                className={cn(
                    "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
                    "w-full max-w-lg mx-4",
                    "bg-card border border-border rounded-xl shadow-2xl",
                    "animate-in fade-in-0 zoom-in-95 duration-200"
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-modal-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 id="edit-modal-title" className="text-lg font-semibold text-foreground">
                        Edit Segment
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        disabled={isLoading}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                        <Xmark className="h-5 w-5" />
                    </Button>
                </div>

                {/* Body */}
                <div className="px-6 py-4 space-y-4">
                    {/* Original text reference (if edited) */}
                    {isEdited && originalText && (
                        <div className="p-3 bg-muted/50 rounded-lg border border-border">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                                Original text:
                            </p>
                            <p className="text-sm text-muted-foreground italic">
                                {originalText}
                            </p>
                        </div>
                    )}

                    {/* Textarea */}
                    <div className="space-y-2">
                        <label htmlFor="segment-text" className="text-sm font-medium text-foreground">
                            Text
                        </label>
                        <textarea
                            ref={textareaRef}
                            id="segment-text"
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                if (error) setError(null);
                            }}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            className={cn(
                                "w-full min-h-[120px] max-h-[300px] resize-y",
                                "px-3 py-2 rounded-lg",
                                "bg-background border border-border",
                                "text-foreground placeholder:text-muted-foreground",
                                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                error && "border-destructive focus:ring-destructive"
                            )}
                            placeholder="Enter segment text..."
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{text.length} characters</span>
                            <span className="text-muted-foreground/70">Ctrl+Enter to save</span>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <WarningCircle className="h-4 w-4 text-destructive shrink-0" />
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30 rounded-b-xl">
                    <div>
                        {isEdited && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRevert}
                                disabled={isLoading}
                                className="gap-2"
                            >
                                {isReverting ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                    <Undo className="h-4 w-4" />
                                )}
                                Revert to Original
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleSave}
                            disabled={isLoading || isBlank}
                            className="gap-2"
                        >
                            {isSaving ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                                <Check className="h-4 w-4" />
                            )}
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
