import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://selmapp.com/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
});

const TOKEN_KEY = 'selm_access_token';
const REFRESH_KEY = 'selm_refresh_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh?: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      tokenStore.clear();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    username: string;
    full_name?: string;
    current_level?: string;
    onboarding_completed?: boolean;
  };
};

export const auth = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    const { data } = await api.post<LoginResponse>('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    tokenStore.set(data.access_token, data.refresh_token);
    return data;
  },

  async register(payload: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
  }): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/register', payload);
    tokenStore.set(data.access_token, data.refresh_token);
    return data;
  },

  async me() {
    const { data } = await api.get('/auth/me');
    return data;
  },

  logout() {
    tokenStore.clear();
  },
};
