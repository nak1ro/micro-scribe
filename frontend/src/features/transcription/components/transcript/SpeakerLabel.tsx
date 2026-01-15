"use client";

import { cn } from "@/lib/utils";
import { getSpeakerColor, getSpeakerBgColor, getSpeakerDisplayName } from "@/lib/utils";
import * as React from "react";
import type { SpeakerInfo } from "@/features/transcription/types";

interface SpeakerLabelProps {
    speakerId: string;
    speakerInfo?: SpeakerInfo;
}

export function SpeakerLabel({ speakerId, speakerInfo }: SpeakerLabelProps) {
    const speakerColor = getSpeakerColor(speakerId, speakerInfo?.color);
    const speakerBgColor = getSpeakerBgColor(speakerId, speakerInfo?.color);
    const speakerName = getSpeakerDisplayName(speakerId, speakerInfo?.displayName);

    return (
        <div className="flex items-center gap-3 py-3">
            {/* Divider */}
            {/* Note: The original code handled divider logic slightly differently (e.g. padding).
                 Here we are creating a standardized label row. The parent might need to decide if it needs top padding.
                 For now, let's keep the pill and divider self-contained.
             */}
            <div className="h-px flex-1 bg-border" />
            <div
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full",
                    speakerBgColor
                )}
            >
                <span
                    className={cn(
                        "w-2 h-2 rounded-full",
                        speakerColor.replace("text-", "bg-")
                    )}
                />
                <span className={cn("text-xs font-semibold", speakerColor)}>
                    {speakerName}
                </span>
            </div>
            <div className="h-px flex-1 bg-border" />
        </div>
    );
}
