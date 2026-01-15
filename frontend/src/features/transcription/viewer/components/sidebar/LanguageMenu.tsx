"use client";

import * as React from "react";
import { cn, getLanguageName } from "@/lib/utils";
import { NavArrowDown, Language, Check, RefreshDouble, Plus } from "iconoir-react";
import { useLanguageMenu, UseLanguageMenuProps } from "../../hooks/useLanguageMenu";

// Styling constants
const triggerButtonClasses = cn(
    "w-full flex items-center justify-between gap-2",
    "px-3 py-2.5 rounded-lg",
    "bg-muted/50 hover:bg-muted",
    "border border-border hover:border-primary/30",
    "text-sm font-medium text-foreground",
    "transition-colors duration-150",
    "disabled:opacity-50 disabled:cursor-not-allowed"
);

const menuItemClasses = cn("w-full flex justify-between px-3 py-2 text-left transition-colors");

const getOptionClasses = (isSelected: boolean, isBusy = false) =>
    cn(menuItemClasses, "items-center gap-3", isSelected ? "bg-primary/5" : "hover:bg-muted", isBusy && "opacity-50");

// Props interface
interface LanguageMenuProps extends UseLanguageMenuProps {
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
    const {
        isOpen,
        setIsOpen,
        menuRef,
        menuId,
        isTranslating,
        currentLangName,
        untranslatedLanguages,
        handleSelectLanguage,
        handleAddTranslation,
    } = useLanguageMenu({
        sourceLanguage,
        translatedLanguages,
        translationStatus,
        translatingToLanguage,
        displayLanguage,
        onDisplayLanguageChange,
        onTranslate,
    });

    return (
        <div ref={menuRef} className={cn("relative h-full", className)}>
            {/* Trigger Card */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                disabled={disabled}
                type="button"
                className={cn(
                    "w-full h-full flex flex-col items-start justify-between gap-4", // Increased gap
                    "p-5 rounded-2xl text-left", // Increased padding & radius
                    "bg-teal-500/10 dark:bg-teal-500/15 hover:bg-teal-500/20", // Slightly stronger tint
                    "border border-teal-500/10 hover:border-teal-500/20",
                    "transition-all duration-200 shadow-sm",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    isOpen && "ring-2 ring-teal-500/20 border-teal-500/30"
                )}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-controls={isOpen ? menuId : undefined}
            >
                <div className="flex items-center justify-between w-full">
                    <div className={cn(
                        "p-2 rounded-lg bg-teal-500/10 text-teal-600", // Bigger icon container
                        isTranslating && "animate-pulse"
                    )}>
                        {isTranslating ? (
                            <RefreshDouble className="h-5 w-5 animate-spin" /> // Bigger icon
                        ) : (
                            <Language className="h-5 w-5" /> // Bigger icon
                        )}
                    </div>
                    {translatedLanguages.length > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700"> {/* Bigger badge */}
                            +{translatedLanguages.length}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-1 w-full">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"> {/* Bigger text */}
                        Language
                    </span>
                    <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-base font-semibold truncate leading-tight"> {/* Bigger text */}
                            {currentLangName}
                        </span>
                        <NavArrowDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200 opacity-50", isOpen && "rotate-180 opacity-100")} />
                    </div>
                </div>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="absolute top-full left-0 w-[240px] mt-2 z-50 bg-popover border border-border rounded-xl shadow-xl py-1 animate-fade-in max-h-80 overflow-y-auto"
                    role="menu"
                    id={menuId}
                >
                    {/* Original language */}
                    <button onClick={() => handleSelectLanguage(null)} type="button" className={getOptionClasses(displayLanguage === null)} role="menuitem">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{getLanguageName(sourceLanguage)}</span>
                            <span className="text-[10px] text-muted-foreground">(Original)</span>
                        </div>
                        {displayLanguage === null && <Check className="h-4 w-4 text-primary" />}
                    </button>

                    {/* Translated languages */}
                    {translatedLanguages.length > 0 && (
                        <>
                            <div className="h-px bg-border my-1" />
                            {translatedLanguages.map((langCode) => {
                                const isBusy = translatingToLanguage === langCode;
                                return (
                                    <button key={langCode} onClick={() => handleSelectLanguage(langCode)} disabled={isBusy} type="button" className={getOptionClasses(displayLanguage === langCode, isBusy)} role="menuitem">
                                        <span className="text-sm text-foreground">{getLanguageName(langCode)}</span>
                                        {displayLanguage === langCode && <Check className="h-4 w-4 text-primary" />}
                                        {isBusy && <RefreshDouble className="h-4 w-4 text-info animate-spin" />}
                                    </button>
                                );
                            })}
                        </>
                    )}

                    {/* Add translation */}
                    {untranslatedLanguages.length > 0 && canTranslate && (
                        <>
                            <div className="h-px bg-border my-1" />
                            <div className="px-3 py-1.5">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Add Translation</span>
                            </div>
                            {untranslatedLanguages.map((lang) => {
                                const isBusy = translatingToLanguage === lang.code;
                                return (
                                    <button key={lang.code} onClick={() => handleAddTranslation(lang.code)} disabled={isTranslating} type="button" className={cn(menuItemClasses, "items-center gap-2", isTranslating ? "opacity-50 cursor-not-allowed" : "hover:bg-muted cursor-pointer")} role="menuitem">
                                        {isBusy ? <RefreshDouble className="h-3.5 w-3.5 text-info animate-spin" /> : <Plus className="h-3.5 w-3.5 text-muted-foreground" />}
                                        <span className="text-sm text-muted-foreground">{lang.name}</span>
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
