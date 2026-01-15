import * as React from "react";

interface UseFileUploadInteractionProps {
    onFileSelect: (file: File) => void;
}

export function useFileUploadInteraction({ onFileSelect }: UseFileUploadInteractionProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleDrop = React.useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            onFileSelect(droppedFile);
        }
    }, [onFileSelect]);

    const handleDragOver = React.useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = React.useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleFileChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            onFileSelect(selectedFile);
        }
        e.target.value = "";
    }, [onFileSelect]);

    const openFileDialog = React.useCallback(() => {
        inputRef.current?.click();
    }, []);

    return {
        isDragging,
        inputRef,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        handleFileChange,
        openFileDialog
    };
}
