"use client";

import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { useDeleteConfirmation } from "@/hooks/useDeleteConfirmation";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    fileName: string;
}

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, fileName }: DeleteConfirmationModalProps) {
    const { isDeleting, error, handleConfirm } = useDeleteConfirmation({ isOpen, onConfirm, onClose });

    const description = (
        <div className="space-y-4">
            <p className="text-muted-foreground">
                Are you sure you want to delete <span className="font-medium text-foreground">{fileName}</span>? This action cannot be undone.
            </p>
            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
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
