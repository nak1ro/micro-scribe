export type FolderColor =
    | "Blue"
    | "Green"
    | "Red"
    | "Yellow"
    | "Purple"
    | "Orange"
    | "Gray";

export interface FolderDto {
    id: string;
    name: string;
    color: FolderColor;
    itemCount: number;
    createdAtUtc: string;
}

export interface CreateFolderRequest {
    name: string;
    color?: FolderColor;
}

export interface UpdateFolderRequest {
    name: string;
    color: FolderColor;
}

export interface UpdateFolderItemsRequest {
    transcriptionJobIds: string[];
}
