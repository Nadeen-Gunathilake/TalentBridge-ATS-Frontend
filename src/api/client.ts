import axios, { type AxiosError } from 'axios';
import { getToken, clearSession } from '../auth/session';

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type UnauthorizedListener = (reason: 'expired' | 'forbidden') => void;
let onUnauthorized: UnauthorizedListener | null = null;

export function registerUnauthorizedHandler(listener: UnauthorizedListener) {
  onUnauthorized = listener;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      clearSession();
      onUnauthorized?.('expired');
    } else if (status === 403) {
      onUnauthorized?.('forbidden');
    }

    return Promise.reject(error);
  },
);

interface BackendErrorBody {
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

export function extractErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as BackendErrorBody | undefined;
    if (data?.errors) {
      const firstFieldError = Object.values(data.errors)[0];
      if (firstFieldError) return firstFieldError;
    }
    return data?.message ?? data?.error ?? fallback;
  }
  return fallback;
}
