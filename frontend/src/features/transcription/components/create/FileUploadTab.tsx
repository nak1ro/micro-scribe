"use client";

import * as React from "react";
import { cn, formatFileSize } from "@/lib/utils";
import { CloudUpload, Folder, Trash } from "iconoir-react";
import { Button } from "@/components/ui";
import { SUPPORTED_FORMATS } from "./constants";

interface FileUploadTabProps {
    file: File | null;
    onFileSelect: (file: File) => void;
    onClear: () => void;
}

export function FileUploadTab({ file, onFileSelect, onClear }: FileUploadTabProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            onFileSelect(droppedFile);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            onFileSelect(selectedFile);
        }
    };

    if (file) {
        return (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CloudUpload className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClear}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                    <Trash className="h-5 w-5" />
                </button>
            </div>
        );
    }

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
                "flex flex-col items-center justify-center gap-4 py-12 px-6",
                "border-2 border-dashed rounded-xl transition-colors",
                isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
            )}
        >
            <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                    Drag & Drop
                </h3>
                <p className="text-sm text-muted-foreground">
                    Supported formats: {SUPPORTED_FORMATS.join(", ")}
                </p>
            </div>

            <div className="text-muted-foreground">or</div>

            <Button
                variant="outline"
                onClick={() => inputRef.current?.click()}
                className="gap-2"
            >
                <Folder className="h-4 w-4" />
                Browse file
            </Button>

            <input
                ref={inputRef}
                type="file"
                accept={SUPPORTED_FORMATS.join(",")}
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}
