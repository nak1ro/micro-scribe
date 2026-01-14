export const FOLDER_ENDPOINTS = {
    LIST: '/folders',
    CREATE: '/folders',
    GET: (id: string) => `/folders/${id}`,
    UPDATE: (id: string) => `/folders/${id}`,
    DELETE: (id: string) => `/folders/${id}`,
    ADD_ITEMS: (id: string) => `/folders/${id}/items`,
    REMOVE_ITEMS: (id: string) => `/folders/${id}/items`,
    LIST_ITEMS: (id: string) => `/folders/${id}/items`,
} as const;
