import * as React from "react";
import { usePlanLimits, useOnClickOutside, useEscapeKey } from "@/hooks";
import { ExportFormat } from "@/features/transcription/types";
import { Page, TextBox, MediaVideo, Table2Columns, MusicDoubleNote, Code } from "iconoir-react";

interface UseExportMenuProps {
    onExport: (format: ExportFormat) => void;
}

const iconMap = {
    Page: Page,
    TextBox: TextBox,
    MediaVideo: MediaVideo,
    Table2Columns: Table2Columns,
    MusicDoubleNote: MusicDoubleNote,
    Code: Code,
} satisfies Record<
    string,
    React.ComponentType<React.SVGProps<SVGSVGElement>>
>;

export function useExportMenu({ onExport }: UseExportMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const { canExport } = usePlanLimits();
    const menuId = React.useId();

    // Close on click outside
    useOnClickOutside(menuRef, () => setIsOpen(false));

    // Close on escape
    useEscapeKey(() => setIsOpen(false), isOpen);

    const handleExport = (format: ExportFormat) => {
        if (!canExport(format)) return;
        onExport(format);
        setIsOpen(false);
    };

    const isIconKey = (icon: string): icon is keyof typeof iconMap =>
        Object.prototype.hasOwnProperty.call(iconMap, icon);

    const getIconComponent = (icon: string) => (isIconKey(icon) ? iconMap[icon] : Page);

    const toggleOpen = () => setIsOpen(!isOpen);

    return {
        isOpen,
        setIsOpen,
        menuRef,
        menuId,
        handleExport,
        canExport,
        getIconComponent,
        toggleOpen
    };
}
