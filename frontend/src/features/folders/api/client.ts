import { apiClient } from "@/services/api/client";
import { FOLDER_ENDPOINTS } from "./routes";
import {
    CreateFolderRequest,
    FolderDto,
    UpdateFolderItemsRequest,
    UpdateFolderRequest
} from "../types";
import { TranscriptionJobListItem, PagedResponse } from "@/types/api/transcription";

export const FoldersService = {
    // CRUD
    getAll: async () => {
        return apiClient.get<FolderDto[]>(FOLDER_ENDPOINTS.LIST);
    },

    getById: async (id: string) => {
        return apiClient.get<FolderDto>(FOLDER_ENDPOINTS.GET(id));
    },

    create: async (data: CreateFolderRequest) => {
        return apiClient.post<FolderDto>(FOLDER_ENDPOINTS.CREATE, data);
    },

    update: async (id: string, data: UpdateFolderRequest) => {
        return apiClient.put<FolderDto>(FOLDER_ENDPOINTS.UPDATE(id), data);
    },

    delete: async (id: string) => {
        return apiClient.delete<void>(FOLDER_ENDPOINTS.DELETE(id));
    },

    // Items
    addItems: async (folderId: string, jobIds: string[]) => {
        const payload: UpdateFolderItemsRequest = { transcriptionJobIds: jobIds };
        return apiClient.post<void>(FOLDER_ENDPOINTS.ADD_ITEMS(folderId), payload);
    },

    removeItems: async (folderId: string, jobIds: string[]) => {
        const payload: UpdateFolderItemsRequest = { transcriptionJobIds: jobIds };
        return apiClient.delete<void>(FOLDER_ENDPOINTS.REMOVE_ITEMS(folderId), {
            data: payload
        });
    },

    listItems: async (folderId: string, page = 1, pageSize = 20) => {
        return apiClient.get<PagedResponse<TranscriptionJobListItem>>(FOLDER_ENDPOINTS.LIST_ITEMS(folderId), {
            params: { page, pageSize },
        });
    },
};
