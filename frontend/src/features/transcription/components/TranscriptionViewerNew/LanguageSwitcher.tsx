"use client";

import * as React from "react";
import { cn, getLanguageName } from "@/lib/utils";
import { Check, Language } from "iconoir-react";

interface LanguageSwitcherProps {
    sourceLanguage: string;
    translatedLanguages: string[];
    selectedLanguage: string | null;
    onSelect: (lang: string | null) => void;
    disabled?: boolean;
    className?: string;
}

export function LanguageSwitcher({
    sourceLanguage,
    translatedLanguages,
    selectedLanguage,
    onSelect,
    disabled,
    className,
}: LanguageSwitcherProps) {
    // Build list of available languages: source first, then translations
    const availableLanguages = React.useMemo(() => {
        const languages = [
            { code: null, name: getLanguageName(sourceLanguage), isSource: true },
            ...translatedLanguages.map(code => ({
                code,
                name: getLanguageName(code),
                isSource: false,
            })),
        ];
        return languages;
    }, [sourceLanguage, translatedLanguages]);

    // Don't render if no translations available
    if (translatedLanguages.length === 0) {
        return null;
    }

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex items-center gap-2 px-1">
                <Language className="h-3.5 w-3.5 text-muted-foreground" />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Viewing
                </h3>
            </div>

            {/* Language pills */}
            <div className="flex flex-wrap gap-2">
                {availableLanguages.map((lang) => {
                    const isSelected = selectedLanguage === lang.code;

                    return (
                        <button
                            key={lang.code ?? "source"}
                            onClick={() => onSelect(lang.code)}
                            disabled={disabled}
                            className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                                "text-sm font-medium transition-all duration-150",
                                "border",
                                isSelected
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted/50 text-foreground border-border hover:border-primary/30 hover:bg-muted",
                                disabled && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {isSelected && <Check className="h-3 w-3" />}
                            <span>{lang.name}</span>
                            {lang.isSource && (
                                <span className="text-[10px] opacity-70">(Original)</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
