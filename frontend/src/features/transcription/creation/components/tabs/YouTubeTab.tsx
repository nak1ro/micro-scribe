"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Youtube, Xmark } from "iconoir-react";

interface YouTubeTabProps {
    url: string;
    onUrlChange: (url: string) => void;
    onClear: () => void;
}

export function YouTubeTab({ url, onUrlChange, onClear }: YouTubeTabProps) {
    const isValidUrl = url.includes("youtube.com") || url.includes("youtu.be");

    return (
        <div className="space-y-4">
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Youtube className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                    type="url"
                    placeholder="Paste YouTube URL here..."
                    value={url}
                    onChange={(e) => onUrlChange(e.target.value)}
                    className={cn(
                        "w-full h-12 pl-10 pr-10 rounded-lg",
                        "bg-background border border-input",
                        "text-foreground placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-ring"
                    )}
                />
                {url && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <Xmark className="h-5 w-5" />
                    </button>
                )}
            </div>

            {url && !isValidUrl && (
                <p className="text-sm text-warning">
                    Please enter a valid YouTube URL
                </p>
            )}

            {url && isValidUrl && (
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Video URL</p>
                    <p className="font-medium text-foreground truncate">{url}</p>
                </div>
            )}
        </div>
    );
}
