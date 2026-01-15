"use client";

import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { useDeleteConfirmation } from "@/hooks/useDeleteConfirmation";

interface ResourceDeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    resourceName: string;
    resourceType?: string;
    title?: string;
}

export function ResourceDeleteDialog({
    isOpen,
    onClose,
    onConfirm,
    resourceName,
    resourceType = "item",
    title
}: ResourceDeleteDialogProps) {
    const { isDeleting, error, handleConfirm } = useDeleteConfirmation({ isOpen, onConfirm, onClose });

    const description = (
        <div className="space-y-4">
            <p className="text-muted-foreground">
                Are you sure you want to delete <span className="font-medium text-foreground">{resourceName}</span>? This action cannot be undone.
            </p>
            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        </div>
    );

    return (
        <ConfirmationDialog
            open={isOpen}
            onOpenChange={(open) => !open && onClose()}
            title={title || `Delete ${resourceType}`}
            description={description}
            confirmText="Delete"
            variant="destructive"
            onConfirm={handleConfirm}
            isLoading={isDeleting}
        />
    );
}
