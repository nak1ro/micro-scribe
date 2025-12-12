"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { SidebarProvider } from "@/context/SidebarContext";

interface DashboardLayoutProps {
    children: React.ReactNode;
    /** User's subscription status */
    isPremium?: boolean;
    /** Transcriptions used today (for free users) */
    transcriptionsUsed?: number;
    /** Max transcriptions per day (for free users) */
    transcriptionsLimit?: number;
}

export function DashboardLayout({
    children,
    isPremium = false,
    transcriptionsUsed = 0,
    transcriptionsLimit = 10,
}: DashboardLayoutProps) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen">
                <Sidebar
                    isPremium={isPremium}
                    transcriptionsUsed={transcriptionsUsed}
                    transcriptionsLimit={transcriptionsLimit}
                />
                <main className="flex-1 min-w-0">
                    <div className="px-4 py-6 lg:px-8">{children}</div>
                </main>
            </div>
        </SidebarProvider>
    );
}
