"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Settings2, X } from "lucide-react";
import { TranscriptionSidebar, SIDEBAR_WIDTH } from "./TranscriptionSidebar";

interface TranscriptionDetailLayoutProps {
    children: React.ReactNode;
    // Sidebar props
    onCopyTranscript: () => void;
    isCopied: boolean;
    showTimecodes: boolean;
    onToggleTimecodes: (show: boolean) => void;
    onDownloadAudio: () => void;
    hasTranscript: boolean;
    hasAudioUrl: boolean;
    hasSegments: boolean;
    // Show sidebar only when transcription is completed
    showSidebar: boolean;
}

export function TranscriptionDetailLayout({
    children,
    showSidebar,
    ...sidebarProps
}: TranscriptionDetailLayoutProps) {
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

    // Close drawer on escape key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsDrawerOpen(false);
        };
        if (isDrawerOpen) {
            document.addEventListener("keydown", handleEscape);
        }
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isDrawerOpen]);

    // Prevent body scroll when drawer is open
    React.useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isDrawerOpen]);

    if (!showSidebar) {
        // No sidebar, just render children
        return <div className="w-full">{children}</div>;
    }

    return (
        <>
            {/* Main Content - with right margin for fixed sidebar on xl+ */}
            <div className="xl:mr-[240px]">
                {children}
            </div>

            {/* Desktop Right Sidebar - Fixed position, hidden below xl */}
            <aside
                className={cn(
                    "hidden xl:flex flex-col",
                    "fixed top-0 right-0 h-screen",
                    "bg-card border-l border-border",
                    "z-30"
                )}
                style={{ width: SIDEBAR_WIDTH }}
            >
                <TranscriptionSidebar {...sidebarProps} />
            </aside>

            {/* Mobile/Tablet FAB - Visible below xl */}
            {!isDrawerOpen && (
                <button
                    type="button"
                    onClick={() => setIsDrawerOpen(true)}
                    className={cn(
                        "xl:hidden fixed bottom-6 right-6 z-40",
                        "flex items-center justify-center",
                        "w-14 h-14 rounded-full",
                        "bg-primary text-primary-foreground",
                        "shadow-lg shadow-primary/25",
                        "hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30",
                        "transition-all duration-200"
                    )}
                    aria-label="Open actions menu"
                >
                    <Settings2 className="h-6 w-6" />
                </button>
            )}

            {/* Drawer Overlay */}
            {isDrawerOpen && (
                <div
                    className="xl:hidden fixed inset-0 z-50 bg-black/50 animate-fade-in"
                    onClick={() => setIsDrawerOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Drawer */}
            <aside
                className={cn(
                    "xl:hidden fixed top-0 right-0 z-50 h-full",
                    "bg-card border-l border-border shadow-xl",
                    "transition-transform duration-300 ease-out",
                    isDrawerOpen ? "translate-x-0" : "translate-x-full"
                )}
                style={{ width: SIDEBAR_WIDTH }}
                aria-label="Actions sidebar"
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <span className="font-medium text-foreground">Actions</span>
                    <button
                        type="button"
                        onClick={() => setIsDrawerOpen(false)}
                        className={cn(
                            "p-1.5 rounded-md",
                            "text-muted-foreground hover:text-foreground",
                            "hover:bg-accent",
                            "transition-colors"
                        )}
                        aria-label="Close actions menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Drawer Content */}
                <div className="h-[calc(100%-57px)] overflow-y-auto">
                    <TranscriptionSidebar {...sidebarProps} />
                </div>
            </aside>
        </>
    );
}
