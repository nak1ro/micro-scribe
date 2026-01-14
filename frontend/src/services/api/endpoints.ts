export const API_ENDPOINTS = {

    MEDIA: {
        LIST: '/media',
        GET: (id: string) => `/media/${id}`,
        DELETE: (id: string) => `/media/${id}`,
    },
    UPLOADS: {
        SESSIONS: '/uploads/sessions',
        GET: (sessionId: string) => `/uploads/sessions/${sessionId}`,
        COMPLETE: (sessionId: string) => `/uploads/sessions/${sessionId}/complete`,
        ABORT: (sessionId: string) => `/uploads/sessions/${sessionId}`,
        UPLOAD_CHUNK: (sessionId: string, chunkIndex: number) => `/uploads/sessions/${sessionId}/chunks/${chunkIndex}`,
    },
    TRANSCRIPTIONS: {
        LIST: '/transcriptions',
        CREATE: '/transcriptions',
        GET: (jobId: string) => `/transcriptions/${jobId}`,
        CANCEL: (jobId: string) => `/transcriptions/${jobId}/cancel`,
        EXPORT: (jobId: string) => `/transcriptions/${jobId}/export`,
        TRANSLATE: (jobId: string) => `/transcriptions/${jobId}/translate`,
        UPDATE_SEGMENT: (jobId: string, segmentId: string) => `/transcriptions/${jobId}/segments/${segmentId}`,
        REVERT_SEGMENT: (jobId: string, segmentId: string) => `/transcriptions/${jobId}/segments/${segmentId}/revert`,
        // Analysis
        ANALYSIS: (jobId: string) => `/transcriptions/${jobId}/analysis`,
        ANALYSIS_TRANSLATE: (jobId: string) => `/transcriptions/${jobId}/analysis/translate`,
        DELETE: (jobId: string) => `/transcriptions/${jobId}`,
    },
    USAGE: {
        ME: '/usage/me',
    },
    FOLDERS: {
        LIST: '/folders',
        CREATE: '/folders',
        GET: (id: string) => `/folders/${id}`,
        UPDATE: (id: string) => `/folders/${id}`,
        DELETE: (id: string) => `/folders/${id}`,
        ADD_ITEMS: (id: string) => `/folders/${id}/items`,
        REMOVE_ITEMS: (id: string) => `/folders/${id}/items`,
        LIST_ITEMS: (id: string) => `/folders/${id}/items`,
    },
} as const;
