import { apiClient, API_ENDPOINTS } from '@/services/api';
import {
    MediaFileResponse,
    PagedResponse,
    PaginationParams,
    CreateTranscriptionJobRequest,
    TranscriptionJobResponse,
    TranscriptionJobListItem,
    TranscriptionJobDetailResponse,
    InitiateUploadRequest,
    UploadSessionResponse,
    CompleteUploadRequest,
    UploadSessionStatusResponse,
} from '@/types/api/transcription';

export const transcriptionApi = {
    listMedia: async (params?: PaginationParams): Promise<PagedResponse<MediaFileResponse>> => {
        const response = await apiClient.get<PagedResponse<MediaFileResponse>>(
            API_ENDPOINTS.MEDIA.LIST,
            { params }
        );
        return response.data;
    },

    getMedia: async (id: string): Promise<MediaFileResponse> => {
        const response = await apiClient.get<MediaFileResponse>(API_ENDPOINTS.MEDIA.GET(id));
        return response.data;
    },

    deleteMedia: async (id: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.MEDIA.DELETE(id));
    },

    // Upload Sessions
    initiateUpload: async (data: InitiateUploadRequest): Promise<UploadSessionResponse> => {
        const response = await apiClient.post<UploadSessionResponse>(
            API_ENDPOINTS.UPLOADS.SESSIONS,
            data
        );
        return response.data;
    },

    completeUpload: async (sessionId: string, data?: CompleteUploadRequest): Promise<UploadSessionStatusResponse> => {
        const response = await apiClient.post<UploadSessionStatusResponse>(
            API_ENDPOINTS.UPLOADS.COMPLETE(sessionId),
            data ?? {}
        );
        return response.data;
    },

    getUploadStatus: async (sessionId: string): Promise<UploadSessionStatusResponse> => {
        const response = await apiClient.get<UploadSessionStatusResponse>(
            API_ENDPOINTS.UPLOADS.GET(sessionId)
        );
        return response.data;
    },

    abortUpload: async (sessionId: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.UPLOADS.ABORT(sessionId));
    },

    // Transcription Jobs
    listJobs: async (params?: PaginationParams): Promise<PagedResponse<TranscriptionJobListItem>> => {
        const response = await apiClient.get<PagedResponse<TranscriptionJobListItem>>(
            API_ENDPOINTS.TRANSCRIPTIONS.LIST,
            { params }
        );
        return response.data;
    },

    createJob: async (data: CreateTranscriptionJobRequest): Promise<TranscriptionJobResponse> => {
        const response = await apiClient.post<TranscriptionJobResponse>(
            API_ENDPOINTS.TRANSCRIPTIONS.CREATE,
            data
        );
        return response.data;
    },

    getJob: async (jobId: string): Promise<TranscriptionJobDetailResponse> => {
        const response = await apiClient.get<TranscriptionJobDetailResponse>(
            API_ENDPOINTS.TRANSCRIPTIONS.GET(jobId)
        );
        return response.data;
    },

    cancelJob: async (jobId: string): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.TRANSCRIPTIONS.CANCEL(jobId));
    },

    exportTranscript: async (jobId: string, format?: number): Promise<Blob> => {
        const response = await apiClient.get(API_ENDPOINTS.TRANSCRIPTIONS.EXPORT(jobId), {
            params: { format },
            responseType: 'blob',
        });
        return response.data;
    },
};
