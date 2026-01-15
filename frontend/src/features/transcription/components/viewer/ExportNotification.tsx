"use client";

import { RefreshDouble } from "iconoir-react";

interface ExportNotificationProps {
    isVisible: boolean;
}

export function ExportNotification({ isVisible }: ExportNotificationProps) {
    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] bg-card text-foreground px-5 py-4 rounded-xl shadow-xl flex items-center gap-3 border border-border">
            <RefreshDouble className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-semibold">Preparing download...</span>
        </div>
    );
}
