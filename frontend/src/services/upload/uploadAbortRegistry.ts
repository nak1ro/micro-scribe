// Simple registry for abort controllers keyed by temp job ID
// Allows TranscriptionCard to abort in-progress uploads

const abortControllers = new Map<string, AbortController>();

export const uploadAbortRegistry = {
    register: (id: string, controller: AbortController) => {
        abortControllers.set(id, controller);
    },

    abort: (id: string): boolean => {
        const controller = abortControllers.get(id);
        if (controller) {
            controller.abort();
            abortControllers.delete(id);
            return true;
        }
        return false;
    },

    unregister: (id: string) => {
        abortControllers.delete(id);
    },

    has: (id: string): boolean => {
        return abortControllers.has(id);
    },
};
