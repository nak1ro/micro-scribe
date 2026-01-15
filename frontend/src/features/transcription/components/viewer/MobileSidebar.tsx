"use client";

import { cn } from "@/lib/utils";
import { Xmark } from "iconoir-react";
import { Button } from "@/components/ui";

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const backdropClasses = "lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40";

const panelClasses = cn(
    "lg:hidden fixed right-0 top-0 bottom-0 z-50",
    "w-80 max-w-[85vw]",
    "bg-background border-l border-border",
    "transition-transform duration-300 ease-in-out",
    "animate-in slide-in-from-right-full duration-300",
    "flex flex-col shadow-2xl"
);

export function MobileSidebar({ isOpen, onClose, children }: MobileSidebarProps) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className={backdropClasses} onClick={onClose} aria-hidden="true" />

            {/* Panel */}
            <aside className={panelClasses}>
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <span className="font-medium text-foreground">Actions</span>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0" aria-label="Close actions menu">
                        <Xmark className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto">{children}</div>
            </aside>
        </>
    );
}
