import * as React from "react";
import { useRouter } from "next/navigation";
import type { TranscriptionListItem, TranscriptionStatus } from "@/types/models/transcription";

const IN_PROGRESS_STATUSES: TranscriptionStatus[] = ["uploading", "pending", "processing"];

interface UseTranscriptionCardProps {
    item: TranscriptionListItem;
    onSelect?: (id: string) => void;
    onCancelUpload?: (id: string) => void;
    onCancelJob?: (id: string) => void;
}

export function useTranscriptionCard({ item, onSelect, onCancelUpload, onCancelJob }: UseTranscriptionCardProps) {
    const router = useRouter();
    const [isHovered, setIsHovered] = React.useState(false);

    const isInProgress = IN_PROGRESS_STATUSES.includes(item.status);

    const formattedDate = new Date(item.uploadDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });

    const handleCardClick = React.useCallback(() => {
        if (isInProgress) return;
        router.push(`/transcriptions/${item.id}`);
    }, [isInProgress, router, item.id]);

    const handleSelect = React.useCallback(
        (e?: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => {
            e?.stopPropagation?.();
            onSelect?.(item.id);
        },
        [item.id, onSelect]
    );

    const handleCancel = React.useCallback(
        (id: string) => {
            if (item.status === "uploading") {
                onCancelUpload?.(id);
            } else {
                onCancelJob?.(id);
            }
        },
        [item.status, onCancelUpload, onCancelJob]
    );

    return {
        isHovered,
        setIsHovered,
        isInProgress,
        formattedDate,
        handleCardClick,
        handleSelect,
        handleCancel,
    };
}
