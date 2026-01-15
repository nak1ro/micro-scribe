import { UploadStatus } from "@/features/transcription/types/upload";

interface UseUploadProgressProps {
    status: UploadStatus;
    progress: number;
}

export function useUploadProgress({ status, progress }: UseUploadProgressProps) {
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

    return {
        statusMessage: getStatusMessage(),
        canCancel
    };
}
