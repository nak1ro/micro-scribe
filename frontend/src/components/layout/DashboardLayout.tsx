"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

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
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 min-w-0 flex flex-col">
                {noPadding ? children : <div className="px-4 py-6 lg:px-8 flex-1">{children}</div>}
            </main>
        </div>
    );
}
