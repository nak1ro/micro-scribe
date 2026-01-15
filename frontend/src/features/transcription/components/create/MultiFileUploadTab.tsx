"use client";

import { useMultiFileUpload } from "@/features/transcription/hooks/useMultiFileUpload";
import { FileListView } from "./FileListView";
import { DropZone } from "./DropZone";

interface MultiFileUploadTabProps {
    files: File[];
    onFilesSelect: (files: File[], append?: boolean) => void;
    onRemoveFile: (index: number) => void;
    onClear: () => void;
    maxFilesPerUpload: number;
    isValidating: boolean;
}

export function MultiFileUploadTab({
    files,
    onFilesSelect,
    onRemoveFile,
    onClear,
    maxFilesPerUpload,
    isValidating,
}: MultiFileUploadTabProps) {
    const upload = useMultiFileUpload({ files, onFilesSelect });

    if (files.length > 0) {
        return (
            <FileListView
                files={files}
                onRemoveFile={onRemoveFile}
                onClear={onClear}
                maxFilesPerUpload={maxFilesPerUpload}
                addMoreInputRef={upload.addMoreInputRef}
                onAddMoreChange={upload.handleAddMoreFiles}
                onAddMoreClick={upload.openAddMorePicker}
            />
        );
    }

    return (
        <DropZone
            isDragging={upload.isDragging}
            isValidating={isValidating}
            maxFilesPerUpload={maxFilesPerUpload}
            inputRef={upload.inputRef}
            onDragOver={upload.handleDragOver}
            onDragLeave={upload.handleDragLeave}
            onDrop={upload.handleDrop}
            onFileChange={upload.handleFileChange}
            onBrowseClick={upload.openFilePicker}
        />
    );
}
