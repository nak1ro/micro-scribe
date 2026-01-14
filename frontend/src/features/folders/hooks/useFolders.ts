import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FoldersService } from "../api/client";
import { CreateFolderRequest, FolderDto, UpdateFolderRequest, FolderColor } from "../types";

// Query keys
export const folderKeys = {
    all: ["folders"] as const,
    detail: (id: string) => ["folders", id] as const,
    items: (id: string) => ["folders", id, "items"] as const,
};

// Color mapping: backend enum -> hex values
export const FOLDER_COLORS: Record<FolderColor, { bg: string; text: string; border: string }> = {
    Blue: { bg: "#EFF6FF", text: "#2563EB", border: "#3B82F6" },
    Green: { bg: "#ECFDF5", text: "#059669", border: "#10B981" },
    Red: { bg: "#FEF2F2", text: "#DC2626", border: "#EF4444" },
    Yellow: { bg: "#FEFCE8", text: "#CA8A04", border: "#EAB308" },
    Purple: { bg: "#FAF5FF", text: "#7C3AED", border: "#8B5CF6" },
    Orange: { bg: "#FFF7ED", text: "#EA580C", border: "#F97316" },
    Gray: { bg: "#F9FAFB", text: "#4B5563", border: "#6B7280" },
};

// Queries
export function useFolders() {
    return useQuery({
        queryKey: folderKeys.all,
        queryFn: async () => {
            const response = await FoldersService.getAll();
            return response.data;
        },
    });
}

export function useFolder(id: string) {
    return useQuery({
        queryKey: folderKeys.detail(id),
        queryFn: async () => {
            const response = await FoldersService.getById(id);
            return response.data;
        },
        enabled: !!id,
    });
}

export function useFolderItems(folderId: string, page = 1, pageSize = 20) {
    return useQuery({
        queryKey: [...folderKeys.items(folderId), page, pageSize],
        queryFn: async () => {
            const response = await FoldersService.listItems(folderId, page, pageSize);
            return response.data;
        },
        enabled: !!folderId,
    });
}

// Mutations
export function useCreateFolder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateFolderRequest) => {
            const response = await FoldersService.create(data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: folderKeys.all });
        },
    });
}

export function useUpdateFolder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateFolderRequest }) => {
            const response = await FoldersService.update(id, data);
            return response.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: folderKeys.all });
            queryClient.invalidateQueries({ queryKey: folderKeys.detail(id) });
        },
    });
}

export function useDeleteFolder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await FoldersService.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: folderKeys.all });
        },
    });
}

export function useAddToFolder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ folderId, jobIds }: { folderId: string; jobIds: string[] }) => {
            await FoldersService.addItems(folderId, jobIds);
        },
        onSuccess: (_, { folderId }) => {
            queryClient.invalidateQueries({ queryKey: folderKeys.all });
            queryClient.invalidateQueries({ queryKey: folderKeys.items(folderId) });
        },
    });
}

export function useRemoveFromFolder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ folderId, jobIds }: { folderId: string; jobIds: string[] }) => {
            await FoldersService.removeItems(folderId, jobIds);
        },
        onSuccess: (_, { folderId }) => {
            queryClient.invalidateQueries({ queryKey: folderKeys.all });
            queryClient.invalidateQueries({ queryKey: folderKeys.items(folderId) });
        },
    });
}
