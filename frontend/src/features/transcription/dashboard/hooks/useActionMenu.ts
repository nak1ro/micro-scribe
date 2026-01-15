import * as React from "react";
import { useOnClickOutside } from "@/hooks";

export function useActionMenu() {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    useOnClickOutside(menuRef, () => setIsOpen(false));

    const toggle = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    }, []);

    const close = React.useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleAction = React.useCallback(
        (action: () => void) => (e: React.MouseEvent) => {
            e.stopPropagation();
            action();
            setIsOpen(false);
        },
        []
    );

    return { isOpen, menuRef, toggle, close, handleAction };
}
