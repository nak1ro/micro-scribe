"use client";

import * as React from "react";
import { X, WarningTriangle } from "iconoir-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useEscapeKey } from "@/hooks";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    fileName: string;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    fileName,
}: DeleteConfirmationModalProps) {
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Reset state when modal opens/closes
    React.useEffect(() => {
        if (isOpen) {
            setIsDeleting(false);
            setError(null);
        }
    }, [isOpen]);

    // Close on escape (disabled while deleting)
    useEscapeKey(onClose, isOpen && !isDeleting);

    const handleConfirm = async () => {
        setIsDeleting(true);
        setError(null);
        try {
            await onConfirm();
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete. Please try again.";
            setError(message);
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={isDeleting ? undefined : onClose}
            />

            {/* Modal */}
            <div
                className={cn(
                    "relative w-full max-w-md mx-4",
                    "bg-card border border-border rounded-xl shadow-2xl",
                    "animate-scale-in"
                )}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-modal-title"
                aria-describedby="delete-modal-description"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-destructive/10">
                            <WarningTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <h2 id="delete-modal-title" className="text-lg font-semibold text-foreground">
                            Delete Transcription
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p id="delete-modal-description" className="text-muted-foreground">
                        Are you sure you want to delete{" "}
                        <span className="font-medium text-foreground">{fileName}</span>?
                        This action cannot be undone.
                    </p>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 p-6 pt-0">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
