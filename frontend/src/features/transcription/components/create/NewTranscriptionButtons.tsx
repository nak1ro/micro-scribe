"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { CloudUpload, Youtube, Microphone } from "iconoir-react";

interface NewTranscriptionButtonsProps {
    onUploadClick?: () => void;
    onYoutubeClick?: () => void;
    onMicClick?: () => void;
}

export function NewTranscriptionButtons({
    onUploadClick,
    onYoutubeClick,
    onMicClick,
}: NewTranscriptionButtonsProps) {
    return (
        <div className="flex flex-wrap gap-3">
            <Button
                variant="default"
                size="lg"
                className="gap-2"
                onClick={() => onUploadClick?.()}
            >
                <CloudUpload className="h-5 w-5" />
                <span>Upload File</span>
            </Button>

            <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => onYoutubeClick?.()}
            >
                <Youtube className="h-5 w-5" />
                <span>YouTube Link</span>
            </Button>

            <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => onMicClick?.()}
            >
                <Microphone className="h-5 w-5" />
                <span>Record Mic</span>
            </Button>
        </div>
    );
}
