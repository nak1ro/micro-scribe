"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { TranscriptionViewerNew } from "@/features/transcription/components/TranscriptionViewerNew";

export default function TranscriptionDetailPage() {
    const params = useParams();
    const jobId = params.id as string;

    return (
        <TranscriptionViewerNew jobId={jobId} />
    );
}
