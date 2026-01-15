import * as React from "react";

interface UseDeleteConfirmationProps {
    isOpen: boolean;
    onConfirm: () => Promise<void>;
    onClose: () => void;
}

export function useDeleteConfirmation({ isOpen, onConfirm, onClose }: UseDeleteConfirmationProps) {
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Reset state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setIsDeleting(false);
            setError(null);
        }
    }, [isOpen]);

    const handleConfirm = React.useCallback(async () => {
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
    }, [onConfirm, onClose]);

    return { isDeleting, error, handleConfirm };
}
