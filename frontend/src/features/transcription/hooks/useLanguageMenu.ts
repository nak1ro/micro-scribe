import * as React from "react";
import { getLanguageName } from "@/lib/utils";
import { useEscapeKey, useOnClickOutside } from "@/hooks";
import { AVAILABLE_LANGUAGES } from "@/features/transcription/constants";

// Props the hook needs from the parent component
export interface UseLanguageMenuProps {
    sourceLanguage: string;
    translatedLanguages: string[];
    translationStatus: string | null;
    translatingToLanguage: string | null;
    displayLanguage: string | null;
    onDisplayLanguageChange: (lang: string | null) => void;
    onTranslate: (targetLanguage: string) => void;
}

// Return type for consuming component
export interface UseLanguageMenuReturn {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    menuRef: React.RefObject<HTMLDivElement | null>;
    menuId: string;
    isTranslating: boolean;
    currentLangName: string;
    untranslatedLanguages: typeof AVAILABLE_LANGUAGES;
    handleSelectLanguage: (langCode: string | null) => void;
    handleAddTranslation: (langCode: string) => void;
}

export function useLanguageMenu({
    sourceLanguage,
    translatedLanguages,
    translationStatus,
    translatingToLanguage,
    displayLanguage,
    onDisplayLanguageChange,
    onTranslate,
}: UseLanguageMenuProps): UseLanguageMenuReturn {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const menuId = React.useId();

    // Derived state
    const isTranslating =
        translationStatus === "Pending" || translationStatus === "Translating";

    const currentLangName = displayLanguage
        ? getLanguageName(displayLanguage)
        : getLanguageName(sourceLanguage);

    const untranslatedLanguages = AVAILABLE_LANGUAGES.filter(
        (lang) =>
            lang.code !== sourceLanguage &&
            !translatedLanguages.includes(lang.code)
    );

    // Close menu handlers
    useOnClickOutside(menuRef, () => setIsOpen(false));
    useEscapeKey(() => setIsOpen(false), isOpen);

    // Event handlers
    const handleSelectLanguage = React.useCallback(
        (langCode: string | null) => {
            onDisplayLanguageChange(langCode);
            setIsOpen(false);
        },
        [onDisplayLanguageChange]
    );

    const handleAddTranslation = React.useCallback(
        (langCode: string) => {
            if (isTranslating) return;
            onTranslate(langCode);
            // Don't close menu - let user see progress
        },
        [isTranslating, onTranslate]
    );

    return {
        isOpen,
        setIsOpen,
        menuRef,
        menuId,
        isTranslating,
        currentLangName,
        untranslatedLanguages,
        handleSelectLanguage,
        handleAddTranslation,
    };
}
