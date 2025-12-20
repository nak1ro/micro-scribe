"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { FloatingActionButton } from "@/components/ui";

interface DashboardLayoutProps {
    children: React.ReactNode;
    /** Callback when New Transcription is clicked (from sidebar or FAB) */
    onNewTranscription?: () => void;
}

export function DashboardLayout({
    children,
    onNewTranscription,
}: DashboardLayoutProps) {
    return (
        <SidebarProvider>
            <DashboardLayoutInner onNewTranscription={onNewTranscription}>
                {children}
            </DashboardLayoutInner>
        </SidebarProvider>
    );
}

// Inner component that can safely use useSidebar
function DashboardLayoutInner({
    children,
    onNewTranscription,
}: DashboardLayoutProps) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="flex min-h-screen">
            <Sidebar onNewTranscription={onNewTranscription} />
            <main className="flex-1 min-w-0 flex flex-col">
                <div className="px-4 py-6 lg:px-8 flex-1">{children}</div>
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
