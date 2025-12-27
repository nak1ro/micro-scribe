"use client";

import * as React from "react";

interface SidebarContextValue {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    toggleCollapse: () => void;
    setCollapsed: (collapsed: boolean) => void;
    openMobile: () => void;
    closeMobile: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(
    undefined
);

const STORAGE_KEY = "sidebar-collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    // Load collapsed state from localStorage on mount
    React.useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
            setIsCollapsed(stored === "true");
        }
    }, []);

    const toggleCollapse = React.useCallback(() => {
        setIsCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem(STORAGE_KEY, String(next));
            return next;
        });
    }, []);

    const setCollapsed = React.useCallback((collapsed: boolean) => {
        setIsCollapsed(collapsed);
        localStorage.setItem(STORAGE_KEY, String(collapsed));
    }, []);

    const openMobile = React.useCallback(() => setIsMobileOpen(true), []);
    const closeMobile = React.useCallback(() => setIsMobileOpen(false), []);

    const value = React.useMemo(
        () => ({
            isCollapsed,
            isMobileOpen,
            toggleCollapse,
            setCollapsed,
            openMobile,
            closeMobile,
        }),
        [isCollapsed, isMobileOpen, toggleCollapse, setCollapsed, openMobile, closeMobile]
    );

    return (
        <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = React.useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
