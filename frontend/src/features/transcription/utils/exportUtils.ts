
import { saveAs } from "file-saver";
import type { ExportFormat } from "../types";
import { transcriptionApi } from "@/services/transcription";
import { API_ENDPOINTS } from "@/services/api";

export const handleExport = async (
    format: ExportFormat,
    jobId: string,
    language: string | null = null,
    audioUrl?: string | null
) => {
    let extension = "";
    let backendFormat = "";

    try {
        switch (format) {
            case "txt":
                backendFormat = "Txt";
                extension = "txt";
                break;
            case "docx":
                backendFormat = "Word";
                extension = "docx";
                break;
            case "srt":
                backendFormat = "Srt";
                extension = "srt";
                break;
            case "vtt":
                backendFormat = "Vtt";
                extension = "vtt";
                break;
            case "json":
                backendFormat = "Json";
                extension = "json";
                break;
            case "csv":
                backendFormat = "Csv";
                extension = "csv";
                break;
            case "mp3":
                if (!audioUrl) {
                    console.warn("No audio URL provided for MP3 export");
                    // Fallback to backend redirect if no URL provided (though UI restricts this)
                    const fallbackUrl = `${process.env.NEXT_PUBLIC_API_URL || ""}${API_ENDPOINTS.TRANSCRIPTIONS.EXPORT(jobId)}?format=Audio`;
                    window.location.href = fallbackUrl;
                } else {
                    // Direct download from Azure (Client-side)
                    // Fetch blob and save to trigger download. This avoids the "play in browser" issue
                    // but causes a delay while buffering. The UI should show a notification.
                    const response = await fetch(audioUrl);
                    if (!response.ok) throw new Error("Failed to fetch audio file");
                    const blob = await response.blob();
                    saveAs(blob, `audio.mp3`);
                }
                return;
        }

        // For non-audio formats, fetch the blob from the API
        const blob = await transcriptionApi.exportTranscript(
            jobId,
            backendFormat,
            language || undefined
        );

        // Use file-saver to download the blob
        // The backend sets Content-Disposition, but we can set a fallback filename if needed
        // However, saveAs with a Blob usually requires a filename.
        // If we don't provide one, it might default to "download".
        // Ideally we should extract filename from headers, but that's hard with the current API wrapper returning Blob directly.
        // Let's rely on browser handling or provide a generic name + extension.
        // Since we don't have the original filename here (we only have jobId), we'll let user rename or rely on browser.
        // Better: The user wanted us to use the backend. The backend sets Content-Disposition.
        // If we use axios (apiClient), we can't easily get headers if `response.data` is returned.
        // But `transcriptionApi.exportTranscript` returns `response.data`.
        // Let's assume we can provide a default name like "transcript".

        saveAs(blob, `transcript.${extension}`);

    } catch (error) {
        console.error("Export failed:", error);
        throw error;
    }
};
