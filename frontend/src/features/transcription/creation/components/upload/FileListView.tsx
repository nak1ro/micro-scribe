"use client";

import { formatFileSize } from "@/lib/utils";
import { CloudUpload, Trash, Folder } from "iconoir-react";
import { Button } from "@/components/ui";
import { SUPPORTED_FORMATS } from "../../constants";

interface FileListViewProps {
    files: File[];
    onRemoveFile: (index: number) => void;
    onClear: () => void;
    maxFilesPerUpload: number;
    addMoreInputRef: React.RefObject<HTMLInputElement | null>;
    onAddMoreChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAddMoreClick: () => void;
}

export function FileListView({
    files,
    onRemoveFile,
    onClear,
    maxFilesPerUpload,
    addMoreInputRef,
    onAddMoreChange,
    onAddMoreClick,
}: FileListViewProps) {
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
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
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
                    <Button variant="outline" size="sm" onClick={onAddMoreClick} className="w-full gap-2">
                        <Folder className="h-4 w-4" />
                        Add more files
                    </Button>
                    <input
                        ref={addMoreInputRef}
                        type="file"
                        multiple
                        accept={SUPPORTED_FORMATS.join(",")}
                        onChange={onAddMoreChange}
                        className="hidden"
                    />
                </>
            )}
        </div>
    );
}
