import * as React from "react";

interface UseMultiFileUploadProps {
    files: File[];
    onFilesSelect: (files: File[], append?: boolean) => void;
}

export function useMultiFileUpload({ files, onFilesSelect }: UseMultiFileUploadProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const addMoreInputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleDrop = React.useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFiles = Array.from(e.dataTransfer.files);
            if (droppedFiles.length > 0) {
                onFilesSelect(droppedFiles, files.length > 0);
            }
        },
        [files.length, onFilesSelect]
    );

    const handleDragOver = React.useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = React.useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleFileChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = Array.from(e.target.files || []);
            if (selectedFiles.length > 0) {
                onFilesSelect(selectedFiles, false);
            }
            e.target.value = "";
        },
        [onFilesSelect]
    );

    const handleAddMoreFiles = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = Array.from(e.target.files || []);
            if (selectedFiles.length > 0) {
                onFilesSelect(selectedFiles, true);
            }
            e.target.value = "";
        },
        [onFilesSelect]
    );

    const openFilePicker = React.useCallback(() => {
        inputRef.current?.click();
    }, []);

    const openAddMorePicker = React.useCallback(() => {
        addMoreInputRef.current?.click();
    }, []);

    return {
        inputRef,
        addMoreInputRef,
        isDragging,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        handleFileChange,
        handleAddMoreFiles,
        openFilePicker,
        openAddMorePicker,
    };
}
