import { API_ENDPOINTS } from "../api/endpoints";
import {
    CreateFolderRequest,
    FolderDto,
    UpdateFolderItemsRequest,
    UpdateFolderRequest
} from "@/types/models/folder";
import { TranscriptionJobListItem, PagedResponse } from "@/types/api/transcription";
import { apiClient } from "../api/client";

export const FoldersService = {
    // CRUD
    getAll: async () => {
        return apiClient.get<FolderDto[]>(API_ENDPOINTS.FOLDERS.LIST);
    },

    getById: async (id: string) => {
        return apiClient.get<FolderDto>(API_ENDPOINTS.FOLDERS.GET(id));
    },

    create: async (data: CreateFolderRequest) => {
        return apiClient.post<FolderDto>(API_ENDPOINTS.FOLDERS.CREATE, data);
    },

    update: async (id: string, data: UpdateFolderRequest) => {
        return apiClient.put<FolderDto>(API_ENDPOINTS.FOLDERS.UPDATE(id), data);
    },

    delete: async (id: string) => {
        return apiClient.delete<void>(API_ENDPOINTS.FOLDERS.DELETE(id));
    },

    // Items
    addItems: async (folderId: string, jobIds: string[]) => {
        const payload: UpdateFolderItemsRequest = { transcriptionJobIds: jobIds };
        return apiClient.post<void>(API_ENDPOINTS.FOLDERS.ADD_ITEMS(folderId), payload);
    },

    removeItems: async (folderId: string, jobIds: string[]) => {
        const payload: UpdateFolderItemsRequest = { transcriptionJobIds: jobIds };
        return apiClient.delete<void>(API_ENDPOINTS.FOLDERS.REMOVE_ITEMS(folderId), {
            data: payload
        });
    },

    listItems: async (folderId: string, page = 1, pageSize = 20) => {
        return apiClient.get<PagedResponse<TranscriptionJobListItem>>(API_ENDPOINTS.FOLDERS.LIST_ITEMS(folderId), {
            params: { page, pageSize },
        });
    },
};
