"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { TranscriptionViewer } from "@/features/transcription";

export default function TranscriptionDetailPage() {
    const params = useParams();
    const jobId = params.id as string;

    return (
        <DashboardLayout>
            <div className="h-full">
                <TranscriptionViewer jobId={jobId} />
            </div>
        </DashboardLayout>
    );
}
