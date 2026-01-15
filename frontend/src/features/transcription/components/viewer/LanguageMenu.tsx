"use client";

import * as React from "react";
import { cn, getLanguageName } from "@/lib/utils";
import { NavArrowDown, Language, Check, RefreshDouble, Plus } from "iconoir-react";
import { useOnClickOutside } from "@/hooks";
import { AVAILABLE_LANGUAGES } from "@/features/transcription/constants";

interface LanguageMenuProps {
    sourceLanguage: string;
    translatedLanguages: string[];
    translationStatus: string | null;
    translatingToLanguage: string | null;
    displayLanguage: string | null;
    onDisplayLanguageChange: (lang: string | null) => void;
    onTranslate: (targetLanguage: string) => void;
    canTranslate?: boolean;
    disabled?: boolean;
    className?: string;
}

export function LanguageMenu({
    sourceLanguage,
    translatedLanguages,
    translationStatus,
    translatingToLanguage,
    displayLanguage,
    onDisplayLanguageChange,
    onTranslate,
    canTranslate = true,
    disabled,
    className,
}: LanguageMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    const isTranslating = translationStatus === "Pending" || translationStatus === "Translating";

    // Close on click outside
    useOnClickOutside(menuRef, () => setIsOpen(false));

    // Get current display language name for button
    const currentLangName = displayLanguage
        ? getLanguageName(displayLanguage)
        : getLanguageName(sourceLanguage);

    // Languages that can be added (not source, not already translated)
    const untranslatedLanguages = AVAILABLE_LANGUAGES.filter(
        lang => lang.code !== sourceLanguage && !translatedLanguages.includes(lang.code)
    );

    const handleSelectLanguage = (langCode: string | null) => {
        onDisplayLanguageChange(langCode);
        setIsOpen(false);
    };

    const handleAddTranslation = (langCode: string) => {
        if (isTranslating) return;
        onTranslate(langCode);
        // Don't close menu - let user see progress
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
                    {isTranslating ? (
                        <RefreshDouble className="h-4 w-4 text-primary animate-spin" />
                    ) : (
                        <Language className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{currentLangName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    {translatedLanguages.length > 0 && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-success/10 text-success">
                            +{translatedLanguages.length}
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
                        "max-h-80 overflow-y-auto"
                    )}
                    role="menu"
                >
                    {/* Source language */}
                    <button
                        onClick={() => handleSelectLanguage(null)}
                        className={cn(
                            "w-full flex items-center justify-between gap-3 px-3 py-2",
                            "text-left transition-colors hover:bg-muted",
                            displayLanguage === null && "bg-primary/5"
                        )}
                        role="menuitem"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                                {getLanguageName(sourceLanguage)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">(Original)</span>
                        </div>
                        {displayLanguage === null && <Check className="h-4 w-4 text-primary" />}
                    </button>

                    {/* Translated languages */}
                    {translatedLanguages.length > 0 && (
                        <>
                            <div className="h-px bg-border my-1" />
                            {translatedLanguages.map((langCode) => {
                                const isSelected = displayLanguage === langCode;
                                const isCurrentlyTranslating = translatingToLanguage === langCode;

                                return (
                                    <button
                                        key={langCode}
                                        onClick={() => handleSelectLanguage(langCode)}
                                        disabled={isCurrentlyTranslating}
                                        className={cn(
                                            "w-full flex items-center justify-between gap-3 px-3 py-2",
                                            "text-left transition-colors",
                                            isSelected ? "bg-primary/5" : "hover:bg-muted",
                                            isCurrentlyTranslating && "opacity-50"
                                        )}
                                        role="menuitem"
                                    >
                                        <span className="text-sm text-foreground">
                                            {getLanguageName(langCode)}
                                        </span>
                                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                                        {isCurrentlyTranslating && (
                                            <RefreshDouble className="h-4 w-4 text-info animate-spin" />
                                        )}
                                    </button>
                                );
                            })}
                        </>
                    )}

                    {/* Add translation section */}
                    {untranslatedLanguages.length > 0 && canTranslate && (
                        <>
                            <div className="h-px bg-border my-1" />
                            <div className="px-3 py-1.5">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    Add Translation
                                </span>
                            </div>
                            {untranslatedLanguages.map((lang) => {
                                const isCurrentlyTranslating = translatingToLanguage === lang.code;

                                return (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleAddTranslation(lang.code)}
                                        disabled={isTranslating}
                                        className={cn(
                                            "w-full flex items-center gap-2 px-3 py-2",
                                            "text-left transition-colors",
                                            isTranslating
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:bg-muted cursor-pointer"
                                        )}
                                        role="menuitem"
                                    >
                                        {isCurrentlyTranslating ? (
                                            <RefreshDouble className="h-3.5 w-3.5 text-info animate-spin" />
                                        ) : (
                                            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                                        )}
                                        <span className="text-sm text-muted-foreground">
                                            {lang.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
