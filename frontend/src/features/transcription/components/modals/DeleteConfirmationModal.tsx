"use client";

import * as React from "react";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

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

    const description = (
        <div className="space-y-4">
            <p className="text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-medium text-foreground">{fileName}</span>?
                This action cannot be undone.
            </p>
            {error && (
                <p className="text-sm text-destructive font-medium">{error}</p>
            )}
        </div>
    );

    return (
        <ConfirmationDialog
            open={isOpen}
            onOpenChange={(open) => !open && onClose()}
            title="Delete Transcription"
            description={description}
            confirmText="Delete"
            variant="destructive"
            onConfirm={handleConfirm}
            isLoading={isDeleting}
        />
    );
}
