"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { NavArrowDown, Language, Sparks } from "iconoir-react";

interface TranslateMenuProps {
    onTranslate?: (languageCode: string) => void;
    disabled?: boolean;
    className?: string;
}

const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "uk", name: "Ukrainian" },
    { code: "ru", name: "Russian" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
];

export function TranslateMenu({ onTranslate, disabled, className }: TranslateMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleSelect = (code: string) => {
        onTranslate?.(code);
        setIsOpen(false);
    };

    return (
        <div ref={menuRef} className={cn("relative", className)}>
            {/* Trigger button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    "w-full flex items-center justify-between gap-2",
                    "px-3 py-2.5 rounded-lg",
                    "bg-muted/50 hover:bg-muted",
                    "border border-border hover:border-primary/30",
                    "text-sm font-medium text-foreground",
                    "transition-colors duration-150",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <div className="flex items-center gap-2">
                    <Language className="h-4 w-4 text-muted-foreground" />
                    <span>Translate</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                        "bg-primary/10 text-primary"
                    )}>
                        Soon
                    </span>
                    <NavArrowDown
                        className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                            isOpen && "rotate-180"
                        )}
                    />
                </div>
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div
                    className={cn(
                        "absolute top-full left-0 right-0 mt-1 z-50",
                        "bg-popover border border-border rounded-lg shadow-lg",
                        "py-1 animate-fade-in",
                        "max-h-64 overflow-y-auto"
                    )}
                    role="menu"
                >
                    {/* Coming soon notice */}
                    <div className="px-3 py-2 border-b border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Sparks className="h-3 w-3" />
                            <span>Translation feature coming soon</span>
                        </div>
                    </div>

                    {/* Language options (disabled) */}
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            disabled
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2",
                                "text-left opacity-50 cursor-not-allowed"
                            )}
                            role="menuitem"
                        >
                            <span className="text-sm text-foreground">{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
