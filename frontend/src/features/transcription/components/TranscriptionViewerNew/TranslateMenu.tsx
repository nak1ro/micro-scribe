"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { NavArrowDown, Language, Check, RefreshDouble } from "iconoir-react";

interface TranslateMenuProps {
    onTranslate: (targetLanguage: string) => void;
    translatedLanguages: string[];
    translationStatus: string | null;
    translatingToLanguage: string | null;
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

export function TranslateMenu({
    onTranslate,
    translatedLanguages,
    translationStatus,
    translatingToLanguage,
    disabled,
    className,
}: TranslateMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    const isTranslating = translationStatus === "Pending" || translationStatus === "Translating";

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
        if (translatedLanguages.includes(code) || isTranslating) return;
        onTranslate(code);
        setIsOpen(false);
    };

    const getStatusText = () => {
        if (translationStatus === "Failed") return "Translation failed";
        if (translatedLanguages.length > 0) return `${translatedLanguages.length} translated`;
        return null;
    };

    const statusText = getStatusText();

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
                    {isTranslating ? (
                        <RefreshDouble className="h-4 w-4 text-primary animate-spin" />
                    ) : (
                        <Language className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>Translate</span>
                </div>
                <div className="flex items-center gap-1.5">
                    {statusText && (
                        <span className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded",
                            translationStatus === "Failed"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-success/10 text-success"
                        )}>
                            {statusText}
                        </span>
                    )}
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
                    {/* In-progress notice */}
                    {isTranslating && translatingToLanguage && (
                        <div className="px-3 py-2 border-b border-border">
                            <div className="flex items-center gap-2 text-xs text-info">
                                <RefreshDouble className="h-3 w-3 animate-spin" />
                                <span>Translating to {languages.find(l => l.code === translatingToLanguage)?.name}...</span>
                            </div>
                        </div>
                    )}

                    {/* Language options */}
                    {languages.map((lang) => {
                        const isCompleted = translatedLanguages.includes(lang.code);
                        const isInProgress = translatingToLanguage === lang.code;

                        return (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                disabled={isCompleted || isTranslating}
                                className={cn(
                                    "w-full flex items-center justify-between gap-3 px-3 py-2",
                                    "text-left transition-colors",
                                    isCompleted && "bg-success/5",
                                    !isCompleted && !isTranslating && "hover:bg-muted cursor-pointer",
                                    (isCompleted || isTranslating) && "cursor-default"
                                )}
                                role="menuitem"
                            >
                                <span className={cn(
                                    "text-sm",
                                    isCompleted ? "text-success font-medium" : "text-foreground"
                                )}>
                                    {lang.name}
                                </span>
                                {isCompleted && <Check className="h-4 w-4 text-success" />}
                                {isInProgress && <RefreshDouble className="h-4 w-4 text-info animate-spin" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

