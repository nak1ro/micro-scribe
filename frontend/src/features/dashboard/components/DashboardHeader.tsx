import * as React from "react";

interface DashboardHeaderProps {
    folderName?: string;
}

export function DashboardHeader({ folderName }: DashboardHeaderProps) {
    return (
        <div>
            <h1 className="text-2xl font-bold text-foreground">
                {folderName || "My Transcriptions"}
            </h1>
            <p className="text-muted-foreground mt-1">
                Manage your audio and video transcriptions
            </p>
        </div>
    );
}
