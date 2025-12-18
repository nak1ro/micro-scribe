"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useCreateFolder, useUpdateFolder, FOLDER_COLORS } from "@/hooks";
import { FolderColor, FolderDto } from "@/types/models/folder";

interface FolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    folder?: FolderDto | null;
}

const COLORS: FolderColor[] = ["Blue", "Green", "Red", "Yellow", "Purple", "Orange", "Gray"];

export function FolderModal({ isOpen, onClose, folder }: FolderModalProps) {
    const [name, setName] = React.useState(folder?.name ?? "");
    const [color, setColor] = React.useState<FolderColor>(folder?.color ?? "Blue");
    const [error, setError] = React.useState("");

    const createMutation = useCreateFolder();
    const updateMutation = useUpdateFolder();

    const isEditing = !!folder;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    React.useEffect(() => {
        if (isOpen) {
            setName(folder?.name ?? "");
            setColor(folder?.color ?? "Blue");
            setError("");
        }
    }, [isOpen, folder]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Folder name is required");
            return;
        }

        if (name.length > 100) {
            setError("Folder name must be 100 characters or less");
            return;
        }

        try {
            if (isEditing && folder) {
                await updateMutation.mutateAsync({ id: folder.id, data: { name: name.trim(), color } });
            } else {
                await createMutation.mutateAsync({ name: name.trim(), color });
            }
            onClose();
        } catch {
            setError("Failed to save folder. Please try again.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div
                className={cn(
                    "relative w-full max-w-md mx-4",
                    "bg-card border border-border rounded-xl shadow-2xl",
                    "animate-scale-in"
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 id="modal-title" className="text-lg font-semibold text-foreground">
                        {folder ? "Edit Folder" : "New Folder"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <label htmlFor="folder-name" className="block text-sm font-medium mb-1.5">
                            Name
                        </label>
                        <input
                            id="folder-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Work Meetings"
                            className={cn(
                                "w-full px-3 py-2 rounded-lg",
                                "bg-background border border-border",
                                "text-foreground placeholder:text-muted-foreground",
                                "focus:outline-none focus:ring-2 focus:ring-primary/50"
                            )}
                            autoFocus
                        />
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Color</label>
                        <div className="flex gap-2">
                            {COLORS.map((c) => {
                                const colors = FOLDER_COLORS[c];
                                return (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={cn(
                                            "w-8 h-8 rounded-lg transition-all",
                                            color === c && "ring-2 ring-offset-2 ring-offset-card ring-current"
                                        )}
                                        style={{
                                            backgroundColor: colors.border,
                                        }}
                                        title={c}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Folder"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
