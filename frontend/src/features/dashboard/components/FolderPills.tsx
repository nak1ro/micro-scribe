"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Folder, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFolders, FOLDER_COLORS } from "@/hooks";
import { FolderModal } from "@/features/folder";
import type { FolderColor } from "@/types/models/folder";

export function FolderPills() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeFolderId = searchParams.get("folder");

    const { data: folders, isLoading } = useFolders();
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const handleFolderClick = (folderId: string | null) => {
        if (folderId) {
            router.push(`/dashboard?folder=${folderId}`);
        } else {
            router.push("/dashboard");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 w-20 rounded-full bg-muted animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                {/* All pill */}
                <FolderPill
                    name="All"
                    isActive={!activeFolderId}
                    onClick={() => handleFolderClick(null)}
                />

                {/* Folder pills */}
                {folders?.map((folder) => (
                    <FolderPill
                        key={folder.id}
                        name={folder.name}
                        color={folder.color}
                        count={folder.itemCount}
                        isActive={activeFolderId === folder.id}
                        onClick={() => handleFolderClick(folder.id)}
                    />
                ))}

                {/* New Folder button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                        "text-sm text-muted-foreground",
                        "border border-dashed border-border",
                        "hover:border-primary hover:text-primary",
                        "transition-colors duration-150"
                    )}
                >
                    <Plus className="h-3.5 w-3.5" />
                    New Folder
                </button>
            </div>

            <FolderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}

interface FolderPillProps {
    name: string;
    color?: FolderColor;
    count?: number;
    isActive?: boolean;
    onClick: () => void;
}

function FolderPill({ name, color, count, isActive, onClick }: FolderPillProps) {
    const colors = color ? FOLDER_COLORS[color] : null;

    return (
        <button
            onClick={onClick}
            className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
                "text-sm font-medium",
                "border transition-all duration-150",
                isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            )}
        >
            {colors && (
                <Folder
                    className="h-3.5 w-3.5"
                    style={{ color: isActive ? "currentColor" : colors.border }}
                />
            )}
            <span>{name}</span>
            {count !== undefined && count > 0 && (
                <span className={cn(
                    "text-xs tabular-nums",
                    isActive ? "opacity-80" : "text-muted-foreground/60"
                )}>
                    {count}
                </span>
            )}
        </button>
    );
}
