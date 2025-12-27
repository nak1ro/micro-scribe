
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import type { TranscriptionData, ExportFormat, ViewerSegment } from "../types";

// Helper to format seconds into HH:MM:SS,mmm
const formatTimestamp = (seconds: number, separator: string = ","): string => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours().toString().padStart(2, "0");
    const mm = date.getUTCMinutes().toString().padStart(2, "0");
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    const ms = date.getUTCMilliseconds().toString().padStart(3, "0");
    return `${hh}:${mm}:${ss}${separator}${ms}`;
};

// Helper to get text in the selected language
const getSegmentText = (segment: ViewerSegment, displayLanguage: string | null): string => {
    if (displayLanguage && segment.translations?.[displayLanguage]) {
        return segment.translations[displayLanguage];
    }
    return segment.text;
};

// plain text export
const exportToTxt = (data: TranscriptionData, displayLanguage: string | null): Blob => {
    const lines = data.segments.map(s => {
        const time = `[${formatTimestamp(s.startSeconds, ".")}]`;
        const speaker = s.speaker ? `${s.speaker}: ` : "";
        return `${time} ${speaker}${getSegmentText(s, displayLanguage)}`;
    });
    return new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
};

// SRT export
const exportToSrt = (data: TranscriptionData, displayLanguage: string | null): Blob => {
    const content = data.segments.map((s, index) => {
        const start = formatTimestamp(s.startSeconds, ",");
        const end = formatTimestamp(s.endSeconds, ",");
        const speaker = s.speaker ? `${s.speaker}: ` : "";
        return `${index + 1}\n${start} --> ${end}\n${speaker}${getSegmentText(s, displayLanguage)}\n`;
    }).join("\n");
    return new Blob([content], { type: "text/plain;charset=utf-8" });
};

// CSV export
const exportToCsv = (data: TranscriptionData, displayLanguage: string | null): Blob => {
    const headers = ["Start Time", "End Time", "Speaker", "Text"];
    const rows = data.segments.map(s => [
        formatTimestamp(s.startSeconds, "."),
        formatTimestamp(s.endSeconds, "."),
        s.speaker || "",
        `"${getSegmentText(s, displayLanguage).replace(/"/g, '""')}"` // Escape quotes
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map(r => r.join(","))
    ].join("\n");

    return new Blob([csvContent], { type: "text/csv;charset=utf-8" });
};

// DOCX export
const exportToDocx = async (data: TranscriptionData, displayLanguage: string | null): Promise<Blob> => {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: data.fileName,
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                ...data.segments.flatMap(s => {
                    const time = `[${formatTimestamp(s.startSeconds, ".")}]`;
                    const speaker = s.speaker ? `${s.speaker}: ` : "";

                    return [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: time + " ",
                                    color: "888888",
                                    size: 20, // 10pt
                                }),
                                new TextRun({
                                    text: speaker,
                                    bold: true,
                                    size: 24, // 12pt
                                }),
                                new TextRun({
                                    text: getSegmentText(s, displayLanguage),
                                    size: 24, // 12pt
                                }),
                            ],
                            spacing: { after: 200 },
                        })
                    ];
                })
            ],
        }],
    });

    return await Packer.toBlob(doc);
};

export const handleExport = async (
    format: ExportFormat,
    data: TranscriptionData,
    displayLanguage: string | null = null
) => {
    const filename = data.fileName.replace(/\.[^/.]+$/, ""); // Remove extension
    let blob: Blob | null = null;
    let extension = "";

    try {
        switch (format) {
            case "txt":
                blob = exportToTxt(data, displayLanguage);
                extension = "txt";
                break;
            case "srt":
                blob = exportToSrt(data, displayLanguage);
                extension = "srt";
                break;
            case "csv":
                blob = exportToCsv(data, displayLanguage);
                extension = "csv";
                break;
            case "docx":
                blob = await exportToDocx(data, displayLanguage);
                extension = "docx";
                break;
            case "mp3":
                if (data.audioUrl) {
                    const response = await fetch(data.audioUrl);
                    if (!response.ok) throw new Error("Failed to fetch audio file");
                    blob = await response.blob();
                    // Try to get extension from url or content-type, default to mp3
                    extension = "mp3";
                }
                break;
        }

        if (blob) {
            saveAs(blob, `${filename}.${extension}`);
        }
    } catch (error) {
        console.error("Export failed:", error);
        // You might want to handle this error in the UI
        throw error;
    }
};

