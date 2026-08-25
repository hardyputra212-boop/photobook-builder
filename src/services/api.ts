// =============================================
// PhotoBook Builder - API Service
// =============================================

// Use relative path for proxy, or absolute URL for direct access
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// =============================================
// Token Management
// =============================================
const getToken = () => localStorage.getItem('photobook_token');
const setToken = (token: string) => localStorage.setItem('photobook_token', token);
const removeToken = () => localStorage.removeItem('photobook_token');

const getUser = () => {
    const userStr = localStorage.getItem('photobook_user');
    return userStr ? JSON.parse(userStr) : null;
};
const setUser = (user: any) => localStorage.setItem('photobook_user', JSON.stringify(user));
const removeUser = () => localStorage.removeItem('photobook_user');

// =============================================
// API Helper
// =============================================
async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = getToken();

    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle unauthorized
    if (response.status === 401 || response.status === 403) {
        removeToken();
        removeUser();
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    const text = await response.text();

    if (!text) {
        throw new Error('Empty response from server');
    }

    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error('Invalid JSON response:', text);
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        throw new Error('Invalid JSON response from server');
    }

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

// =============================================
// AUTH API
// =============================================
export const authApi = {
    async login(email: string, password: string) {
        const data = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        setToken(data.token);
        setUser(data.user);
        return data;
    },

    async register(email: string, password: string, name: string, role: 'admin' | 'customer') {
        return apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, role }),
        });
    },

    async getCurrentUser() {
        return apiRequest('/api/auth/me');
    },

    logout() {
        removeToken();
        removeUser();
    },

    isAuthenticated() {
        return !!getToken();
    },

    getCurrentUserSync() {
        return getUser();
    },
};

// =============================================
// USERS API (Admin Only)
// =============================================
export const usersApi = {
    async getAll() {
        return apiRequest('/api/users');
    },

    async update(id: number, data: { name?: string; role?: string; is_active?: boolean; expires_at?: string | null }) {
        return apiRequest(`/api/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async delete(id: number) {
        return apiRequest(`/api/users/${id}`, {
            method: 'DELETE',
        });
    },
};

// =============================================
// HOME CONTENT API
// =============================================
export const homeApi = {
    async get() {
        return apiRequest('/api/home-content');
    },

    async update(data: any) {
        return apiRequest('/api/home-content', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async uploadImage(file: File) {
        const token = getToken();
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        const text = await response.text();
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            throw new Error('Invalid response from server');
        }

        if (!response.ok) {
            throw new Error(result.error || 'Upload failed');
        }
        return result;
    },
};

// =============================================
// PROJECTS API
// =============================================
export const projectsApi = {
    async getAll() {
        return apiRequest('/api/projects');
    },

    async getOne(id: number) {
        return apiRequest(`/api/projects/${id}`);
    },

    async create(data: any) {
        return apiRequest('/api/projects', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async update(id: number, data: any) {
        return apiRequest(`/api/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async delete(id: number) {
        return apiRequest(`/api/projects/${id}`, {
            method: 'DELETE',
        });
    },
};

// =============================================
// STATS API
// =============================================
export const statsApi = {
    async get() {
        return apiRequest('/api/stats');
    },
};

// =============================================
// EXPORT API BASE URL
// =============================================
export { API_BASE_URL };
