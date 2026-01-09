"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { VerificationBanner } from "@/components/common/VerificationBanner";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    return (
        <SidebarProvider>
            <DashboardLayoutInner>
                {children}
            </DashboardLayoutInner>
        </SidebarProvider>
    );
}

// Inner component that can safely use useSidebar
function DashboardLayoutInner({
    children,
}: DashboardLayoutProps) {
    const { isCollapsed } = useSidebar();
    const pathname = usePathname();
    const noPadding = pathname?.includes("/transcriptions/");

    return (
        <div
            className="flex flex-col min-h-screen"
            style={{ paddingTop: "var(--banner-height, 0px)" }}
        >
            {/* Full-width verification banner at the top (fixed position) */}
            <VerificationBanner />

            {/* Main layout with sidebar and content */}
            <div className={cn("flex flex-1", noPadding ? "h-0 overflow-hidden" : "")}>
                <Sidebar />
                <main className="flex-1 min-w-0 flex flex-col">
                    {noPadding ? children : <div className="px-4 py-6 pb-24 lg:px-8 lg:pb-6 flex-1">{children}</div>}
                </main>
            </div>
        </div>
    );
}

