"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { Upload, Youtube, Mic } from "lucide-react";

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
                onClick={() => {
                    // TODO: Implement file upload modal
                    console.log("Upload file clicked");
                    onUploadClick?.();
                }}
            >
                <Upload className="h-5 w-5" />
                <span>Upload File</span>
            </Button>

            <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => {
                    // TODO: Implement YouTube URL modal
                    console.log("YouTube link clicked");
                    onYoutubeClick?.();
                }}
            >
                <Youtube className="h-5 w-5" />
                <span>YouTube Link</span>
            </Button>

            <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => {
                    // TODO: Implement microphone recording
                    console.log("Record mic clicked");
                    onMicClick?.();
                }}
            >
                <Mic className="h-5 w-5" />
                <span>Record Mic</span>
            </Button>
        </div>
    );
}
