"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { FloatingActionButton } from "@/components/ui";

interface DashboardLayoutProps {
    children: React.ReactNode;
    /** User's subscription status */
    isPremium?: boolean;
    /** Transcriptions used today (for free users) */
    transcriptionsUsed?: number;
    /** Max transcriptions per day (for free users) */
    transcriptionsLimit?: number;
    /** Callback when New Transcription is clicked (from sidebar or FAB) */
    onNewTranscription?: () => void;
}

export function DashboardLayout({
    children,
    isPremium = false,
    transcriptionsUsed = 0,
    transcriptionsLimit = 10,
    onNewTranscription,
}: DashboardLayoutProps) {
    return (
        <SidebarProvider>
            <DashboardLayoutInner
                isPremium={isPremium}
                transcriptionsUsed={transcriptionsUsed}
                transcriptionsLimit={transcriptionsLimit}
                onNewTranscription={onNewTranscription}
            >
                {children}
            </DashboardLayoutInner>
        </SidebarProvider>
    );
}

// Inner component that can safely use useSidebar
function DashboardLayoutInner({
    children,
    isPremium,
    transcriptionsUsed,
    transcriptionsLimit,
    onNewTranscription,
}: DashboardLayoutProps) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="flex min-h-screen">
            <Sidebar
                isPremium={isPremium}
                transcriptionsUsed={transcriptionsUsed}
                transcriptionsLimit={transcriptionsLimit}
                onNewTranscription={onNewTranscription}
            />
            <main className="flex-1 min-w-0">
                <div className="px-4 py-6 lg:px-8">{children}</div>
            </main>

            {/* Floating Action Button - Shows when sidebar is collapsed */}
            {isCollapsed && onNewTranscription && (
                <FloatingActionButton
                    onClick={onNewTranscription}
                    label="New Transcription"
                />
            )}
        </div>
    );
}
