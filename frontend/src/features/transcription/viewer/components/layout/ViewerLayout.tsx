"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./MobileSidebar";

interface ViewerLayoutProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
    audioPlayer: React.ReactNode;
    isSidebarOpen: boolean;
    onCloseSidebar: () => void;
    className?: string;
}

const desktopSidebarClasses = cn(
    "hidden lg:flex flex-col",
    "w-80 xl:w-96 shrink-0", // Increased width
    "border-l border-border",
    "bg-background/50 backdrop-blur-sm" // Added subtle depth
);

export function ViewerLayout({
    children,
    sidebar,
    audioPlayer,
    isSidebarOpen,
    onCloseSidebar,
    className,
}: ViewerLayoutProps) {
    return (
        <div className={cn("flex flex-col h-full bg-background", className)}>
            {/* Main content area */}
            <div className="flex-1 flex min-h-0 relative">
                {/* Transcript area */}
                <main className="flex-1 min-w-0 overflow-hidden flex flex-col">
                    {children}
                </main>

                {/* Desktop Sidebar */}
                <aside className={desktopSidebarClasses}>{sidebar}</aside>

                {/* Mobile Sidebar */}
                <MobileSidebar isOpen={isSidebarOpen} onClose={onCloseSidebar}>
                    {sidebar}
                </MobileSidebar>
            </div>

            {/* Audio player - fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
                {audioPlayer}
            </div>
        </div>
    );
}
