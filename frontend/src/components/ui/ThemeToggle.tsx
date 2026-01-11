"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { SunLight, HalfMoon } from "iconoir-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button
                type="button"
                className="p-2 rounded-md text-muted-foreground"
                aria-label="Toggle theme"
            >
                <SunLight className="h-5 w-5" />
            </button>
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
                "p-2 rounded-md",
                "text-muted-foreground hover:text-foreground hover:bg-accent",
                "transition-colors duration-[var(--transition-fast)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? <SunLight className="h-5 w-5" /> : <HalfMoon className="h-5 w-5" />}
        </button>
    );
}
