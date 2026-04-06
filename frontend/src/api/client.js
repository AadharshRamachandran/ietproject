import axios from 'axios';

// Use VITE_API_BASE_URL if provided, otherwise construct from VITE_BACKEND_URL
// In production, VITE_API_BASE_URL will be the full backend URL + /api/v1
// In development, defaults to /api/v1 (proxied by Vite)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
  : (import.meta.env.VITE_BACKEND_URL 
      ? `${import.meta.env.VITE_BACKEND_URL}/api/v1`
      : '/api/v1');

console.log('[AetherNet API] Base URL:', API_BASE_URL);

const api=axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// Attach Clerk JWT token to outgoing requests
api.interceptors.request.use(async (config) => {
    try {
        const clerk=window.Clerk;
        if (clerk?.session) {
            const token=await clerk.session.getToken();
            if (token) {
                config.headers.Authorization=`Bearer ${token}`;
            }
        }
    } catch (err) {
        console.warn('[AetherNet] Could not attach Clerk token:', err.message);
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            console.warn('[AetherNet] 401 Unauthorized - session may have expired.');
        }
        if (err.response?.status === 403) {
            console.error('[AetherNet] 403 Forbidden - insufficient permissions.');
        }
        if (err.code === 'ECONNABORTED') {
            console.error('[AetherNet] Request timeout - backend may be unavailable.');
        }
        return Promise.reject(err);
    }
);

export default api;

export const authApi={
    me: () => api.get('/auth/me'),
    sync: () => api.post('/auth/sync'),
};

export const baseModelsApi={
    list: () => api.get('/base-models'),
    catalogue: () => api.get('/base-models/catalogue'),
};

export const modelsApi={
    list: (params) => api.get('/models', { params }),
    get: (id) => api.get(`/models/${id}`),
    delete: (id) => api.delete(`/models/${id}`),
    publish: (formData) => api.post('/models/publish', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const versionsApi={
    list: (modelId) => api.get(`/models/${modelId}/versions`),
    upload: (modelId, formData) => api.post(`/models/${modelId}/versions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const sessionsApi={
    list: (params) => api.get('/sessions', { params }),
    get: (sessionKey) => api.get(`/sessions/${sessionKey}`),
    create: (payload) => api.post('/sessions', payload),
    start: (sessionKey, payload={}) => api.post(`/sessions/${sessionKey}/start`, payload),
    publishFinal: (sessionKey) => api.post(`/sessions/${sessionKey}/publish-final`),
    requestAccess: (sessionId, payload={}) => api.post(`/sessions/${sessionId}/request-access`, payload),
    approveRequest: (sessionId, requestUserId) => api.post(`/sessions/${sessionId}/requests/${requestUserId}/approve`),
    lockJoin: (sessionId) => api.post(`/sessions/${sessionId}/lock-join`),
    join: (sessionKey, payload={}) => api.post(`/sessions/${sessionKey}/join`, payload),
    createInvite: (sessionKey) => api.post(`/sessions/${sessionKey}/invite`),
    clearEvents: (sessionKey) => api.delete(`/sessions/${sessionKey}/clear-events`),
    delete: (sessionId) => api.delete(`/sessions/${sessionId}`),
};
