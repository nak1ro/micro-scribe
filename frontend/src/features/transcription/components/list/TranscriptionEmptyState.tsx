"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CloudUpload, Youtube, Microphone, MusicDoubleNote } from "iconoir-react";
import { useEmailVerification } from "@/context/VerificationContext";
import { EmptyStateOptionCard } from "./EmptyStateOptionCard";

type InputType = "file" | "youtube" | "voice";

interface TranscriptionEmptyStateProps {
    onNewClick?: (type?: InputType) => void;
}

export function TranscriptionEmptyState({ onNewClick }: TranscriptionEmptyStateProps) {
    const { isVerified, isLoading, openModal: openVerificationModal } = useEmailVerification();

    const handleClick = (type: InputType) => {
        if (isLoading || isVerified) {
            onNewClick?.(type);
        } else {
            openVerificationModal();
        }
    };

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center",
                "py-16 px-8 text-center",
                "border border-border rounded-xl",
                "bg-card"
            )}
        >
            <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <MusicDoubleNote className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary/30" />
                <div className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-secondary/30" />
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-2">
                No transcriptions yet
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md">
                Get started by uploading your first audio or video file, pasting a YouTube link, or recording directly.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
                <EmptyStateOptionCard
                    icon={CloudUpload}
                    title="Upload File"
                    description="Audio or video"
                    onClick={() => handleClick("file")}
                />
                <EmptyStateOptionCard
                    icon={Youtube}
                    title="YouTube Link"
                    description="From URL"
                    onClick={() => handleClick("youtube")}
                />
                <EmptyStateOptionCard
                    icon={Microphone}
                    title="Record Voice"
                    description="Use microphone"
                    onClick={() => handleClick("voice")}
                />
            </div>
        </div>
    );
}
