"use client";

import * as React from "react";
import { RefreshDouble } from "iconoir-react";
import { Button } from "@/components/ui";
import { UploadStatus } from "@/features/transcription/types";

interface UploadProgressOverlayProps {
    status: UploadStatus;
    progress: number;
    onCancel: () => void;
}

export function UploadProgressOverlay({ status, progress, onCancel }: UploadProgressOverlayProps) {
    const getStatusMessage = () => {
        switch (status) {
            case "initiating":
                return "Preparing upload...";
            case "uploading":
                return `Uploading file... ${progress}%`;
            case "completing":
                return "Finishing upload...";
            case "validating":
                return "Validating file...";
            case "creating-job":
                return "Creating transcription...";
            default:
                return "Processing...";
        }
    };

    const canCancel = status === "uploading";

    return (
        <div className="p-6">
            <div className="flex flex-col items-center gap-6 py-8">
                {/* Spinner or progress indicator */}
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-muted flex items-center justify-center">
                        {status === "uploading" ? (
                            <span className="text-xl font-bold text-primary">{progress}%</span>
                        ) : (
                            <RefreshDouble className="h-8 w-8 text-primary animate-spin" />
                        )}
                    </div>
                    {/* Progress ring for uploading */}
                    {status === "uploading" && (
                        <svg
                            className="absolute inset-0 -rotate-90"
                            width="80"
                            height="80"
                            viewBox="0 0 80 80"
                            aria-hidden="true"
                        >
                            <circle
                                cx="40"
                                cy="40"
                                r="36"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="text-primary"
                                strokeDasharray={`${2 * Math.PI * 36}`}
                                strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
                                strokeLinecap="round"
                            />
                        </svg>
                    )}
                </div>

                {/* Status message */}
                <div className="text-center">
                    <p className="font-semibold text-foreground">{getStatusMessage()}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {canCancel ? "You can cancel the upload" : "Please don't close this window"}
                    </p>
                </div>

                {/* Cancel button (only during upload phase) */}
                {canCancel && (
                    <Button variant="ghost" onClick={onCancel}>
                        Cancel Upload
                    </Button>
                )}
            </div>
        </div>
    );
}
