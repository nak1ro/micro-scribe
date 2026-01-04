"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Menu, Xmark } from "iconoir-react";
import { Button } from "@/components/ui";

interface ViewerLayoutProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
    audioPlayer: React.ReactNode;
    isSidebarOpen: boolean;
    onCloseSidebar: () => void;
    className?: string;
}

export function ViewerLayout({
    children,
    sidebar,
    audioPlayer,
    isSidebarOpen,
    onCloseSidebar,
    className
}: ViewerLayoutProps) {
    return (
        <div className={cn("flex flex-col h-full bg-background", className)}>
            {/* Main content area */}
            <div className="flex-1 flex min-h-0 relative">
                {/* Transcript area */}
                <main className="flex-1 min-w-0 overflow-hidden flex flex-col">
                    {children}
                </main>

                {/* Desktop Sidebar - fixed on right */}
                <aside
                    className={cn(
                        "hidden lg:flex flex-col",
                        "w-72 xl:w-80 shrink-0",
                        "border-l border-border",
                        "bg-background"
                    )}
                >
                    {sidebar}
                </aside>

                {/* Mobile sidebar - slide from right */}
                {isSidebarOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                            onClick={onCloseSidebar}
                            aria-hidden="true"
                        />

                        {/* Sidebar panel */}
                        <aside
                            className={cn(
                                "lg:hidden fixed right-0 top-0 bottom-0 z-50",
                                "w-80 max-w-[85vw]",
                                "bg-background border-l border-border",
                                "bg-background border-l border-border",
                                "transition-transform duration-300 ease-in-out",
                                "animate-in slide-in-from-right-full duration-300",
                                "flex flex-col shadow-2xl"
                            )}
                        >
                            {/* Close button */}
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <span className="font-medium text-foreground">Actions</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onCloseSidebar}
                                    className="h-8 w-8 p-0"
                                    aria-label="Close actions menu"
                                >
                                    <Xmark className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {sidebar}
                            </div>
                        </aside>
                    </>
                )}
            </div>

            {/* Audio player - fixed at bottom, overlays sidebar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
                {audioPlayer}
            </div>
        </div>
    );
}
