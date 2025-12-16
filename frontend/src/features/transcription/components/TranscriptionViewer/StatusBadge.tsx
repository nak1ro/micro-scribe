import { cn } from "@/lib/utils";
import { TranscriptionJobStatus } from "@/types/api/transcription";

interface StatusBadgeProps {
    status: TranscriptionJobStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = {
        [TranscriptionJobStatus.Pending]: { label: "Pending", className: "bg-warning/10 text-warning" },
        [TranscriptionJobStatus.Processing]: { label: "Processing", className: "bg-info/10 text-info" },
        [TranscriptionJobStatus.Completed]: { label: "Completed", className: "bg-success/10 text-success" },
        [TranscriptionJobStatus.Failed]: { label: "Failed", className: "bg-destructive/10 text-destructive" },
        [TranscriptionJobStatus.Cancelled]: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
    };

    const { label, className } = config[status] || config[TranscriptionJobStatus.Pending];

    return (
        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", className)}>
            {label}
        </span>
    );
}
