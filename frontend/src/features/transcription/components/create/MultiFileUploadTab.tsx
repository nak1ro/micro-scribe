"use client";

import * as React from "react";
import { cn, formatFileSize } from "@/lib/utils";
import { CloudUpload, Folder, Trash } from "iconoir-react";
import { Button } from "@/components/ui";
import { SUPPORTED_FORMATS } from "./constants";

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
    isValidating
}: MultiFileUploadTabProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const addMoreInputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            onFilesSelect(droppedFiles, files.length > 0);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length > 0) {
            onFilesSelect(selectedFiles, false);
        }
        e.target.value = "";
    };

    const handleAddMoreFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length > 0) {
            onFilesSelect(selectedFiles, true);
        }
        e.target.value = "";
    };

    // If files are selected, show the file list
    if (files.length > 0) {
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        {files.length} file{files.length !== 1 ? "s" : ""} selected
                        {maxFilesPerUpload > 1 && ` (max ${maxFilesPerUpload})`}
                    </span>
                    <button
                        type="button"
                        onClick={onClear}
                        className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                    >
                        Clear all
                    </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {files.map((file, index) => (
                        <div
                            key={`${file.name}-${index}`}
                            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border"
                        >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <CloudUpload className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatFileSize(file.size)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => onRemoveFile(index)}
                                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                title="Remove file"
                            >
                                <Trash className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {maxFilesPerUpload > 1 && files.length < maxFilesPerUpload && (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addMoreInputRef.current?.click()}
                            className="w-full gap-2"
                        >
                            <Folder className="h-4 w-4" />
                            Add more files
                        </Button>
                        <input
                            ref={addMoreInputRef}
                            type="file"
                            multiple
                            accept={SUPPORTED_FORMATS.join(",")}
                            onChange={handleAddMoreFiles}
                            className="hidden"
                        />
                    </>
                )}
            </div>
        );
    }

    // Empty state - drag & drop zone
    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
                "flex flex-col items-center justify-center gap-4 py-8 sm:py-12 px-6",
                "border-2 border-dashed rounded-xl transition-colors",
                isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
            )}
        >
            {isValidating ? (
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Validating files...</p>
                </div>
            ) : (
                <>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                            <span className="hidden sm:inline">Drag & Drop</span>
                            <span className="sm:hidden">Select Files</span>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {maxFilesPerUpload > 1
                                ? `Up to ${maxFilesPerUpload} files`
                                : "Drop your file here"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                            {SUPPORTED_FORMATS.join(", ")}
                        </p>
                    </div>

                    <div className="text-muted-foreground hidden sm:block">or</div>

                    <Button
                        variant="outline"
                        onClick={() => inputRef.current?.click()}
                        className="gap-2"
                    >
                        <Folder className="h-4 w-4" />
                        Browse {maxFilesPerUpload > 1 ? "files" : "file"}
                    </Button>

                    <input
                        ref={inputRef}
                        type="file"
                        multiple={maxFilesPerUpload > 1}
                        accept={SUPPORTED_FORMATS.join(",")}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </>
            )}
        </div>
    );
}
