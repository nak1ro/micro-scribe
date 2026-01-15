"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Folder } from "iconoir-react";
import { Button } from "@/components/ui";
import { SUPPORTED_FORMATS } from "./constants";

interface DropZoneProps {
    isDragging: boolean;
    isValidating: boolean;
    maxFilesPerUpload: number;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBrowseClick: () => void;
}

const dropZoneClasses = (isDragging: boolean) =>
    cn(
        "flex flex-col items-center justify-center gap-4 py-8 sm:py-12 px-6",
        "border-2 border-dashed rounded-xl transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
    );

export function DropZone({
    isDragging,
    isValidating,
    maxFilesPerUpload,
    inputRef,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileChange,
    onBrowseClick,
}: DropZoneProps) {
    return (
        <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} className={dropZoneClasses(isDragging)}>
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
                            {maxFilesPerUpload > 1 ? `Up to ${maxFilesPerUpload} files` : "Drop your file here"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                            {SUPPORTED_FORMATS.join(", ")}
                        </p>
                    </div>

                    <div className="text-muted-foreground hidden sm:block">or</div>

                    <Button variant="outline" onClick={onBrowseClick} className="gap-2">
                        <Folder className="h-4 w-4" />
                        Browse {maxFilesPerUpload > 1 ? "files" : "file"}
                    </Button>

                    <input
                        ref={inputRef}
                        type="file"
                        multiple={maxFilesPerUpload > 1}
                        accept={SUPPORTED_FORMATS.join(",")}
                        onChange={onFileChange}
                        className="hidden"
                    />
                </>
            )}
        </div>
    );
}
