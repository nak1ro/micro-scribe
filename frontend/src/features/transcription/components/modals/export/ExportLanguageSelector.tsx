"use client";

import * as React from "react";
import { Check, RefreshDouble, Plus, Lock } from "iconoir-react";
import { cn, getLanguageName } from "@/lib/utils";
import { AVAILABLE_LANGUAGES } from "@/features/transcription/constants";
import type { TranscriptionJobDetailResponse } from "@/features/transcription/types";

interface ExportLanguageSelectorProps {
    job?: TranscriptionJobDetailResponse | undefined;
    selectedLanguage: string | null;
    onSelect: (lang: string | null) => void;
    onTranslate: (langCode: string) => void;
    isTranslating: boolean;
    isJobTranslating: boolean;
    canTranslate: boolean;
}

export function ExportLanguageSelector({
    job,
    selectedLanguage,
    onSelect,
    onTranslate,
    isTranslating,
    isJobTranslating,
    canTranslate,
}: ExportLanguageSelectorProps) {
    if (!job) return null;

    const sourceLanguage = job.sourceLanguage || "en";
    const translatedLanguages = job.translatedLanguages || [];
    const translatingToLanguage = job.translatingToLanguage;

    // Languages that can be added (not source, not already translated)
    const untranslatedLanguages = AVAILABLE_LANGUAGES.filter(
        lang => lang.code !== sourceLanguage && !translatedLanguages.includes(lang.code)
    );

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Language</h3>
            <div className="border border-border rounded-lg overflow-hidden">
                {/* Source language */}
                <button
                    onClick={() => onSelect(null)}
                    className={cn(
                        "w-full flex items-center justify-between gap-3 px-4 py-3",
                        "text-left transition-colors",
                        selectedLanguage === null ? "bg-primary/5" : "hover:bg-muted"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                            {getLanguageName(sourceLanguage)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">(Original)</span>
                    </div>
                    {selectedLanguage === null && <Check className="h-4 w-4 text-primary" />}
                </button>

                {/* Translated languages */}
                {translatedLanguages.length > 0 && (
                    <>
                        <div className="h-px bg-border" />
                        {translatedLanguages.map((langCode) => {
                            const isSelected = selectedLanguage === langCode;
                            const isCurrentlyTranslating = translatingToLanguage === langCode;

                            return (
                                <button
                                    key={langCode}
                                    onClick={() => onSelect(langCode)}
                                    disabled={isCurrentlyTranslating}
                                    className={cn(
                                        "w-full flex items-center justify-between gap-3 px-4 py-3",
                                        "text-left transition-colors border-t border-border",
                                        isSelected ? "bg-primary/5" : "hover:bg-muted",
                                        isCurrentlyTranslating && "opacity-50"
                                    )}
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
                {untranslatedLanguages.length > 0 && (
                    <>
                        <div className="h-px bg-border" />
                        <div className="px-4 py-2 bg-muted/30">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Add Translation
                            </span>
                        </div>
                        <div className="max-h-32 overflow-y-auto">
                            {untranslatedLanguages.map((lang) => {
                                const isCurrentlyTranslating = translatingToLanguage === lang.code;
                                const isRestricted = !canTranslate;

                                return (
                                    <button
                                        key={lang.code}
                                        onClick={() => !isRestricted && onTranslate(lang.code)}
                                        disabled={isTranslating || isJobTranslating || isRestricted}
                                        className={cn(
                                            "w-full flex items-center justify-between gap-2 px-4 py-2.5",
                                            "text-left transition-colors border-t border-border",
                                            (isTranslating || isJobTranslating || isRestricted)
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:bg-muted cursor-pointer"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            {isCurrentlyTranslating ? (
                                                <RefreshDouble className="h-3.5 w-3.5 text-info animate-spin" />
                                            ) : (
                                                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                                            )}
                                            <span className="text-sm text-muted-foreground">
                                                {lang.name}
                                            </span>
                                        </div>
                                        {isRestricted && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
