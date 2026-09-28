import axios, { AxiosError } from 'axios';
import { tokenStorage } from '../utils/storage';

export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3100').replace(/\/+$/, '');

export interface ApiError {
  status: number;
  message: string;
}

export const apiClient = axios.create({ baseURL: API_URL });

let onUnauthorized: (() => void) | null = null;

/** Registered by the store so a 401 anywhere signs the user out. */
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

export function authHeader(): Record<string, string> {
  const token = tokenStorage.get();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function notifyUnauthorized(): void {
  onUnauthorized?.();
}

apiClient.interceptors.request.use((config) => {
  Object.entries(authHeader()).forEach(([key, value]) => config.headers.set(key, value));
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      notifyUnauthorized();
    }
    return Promise.reject(error);
  },
);

/** Nest error bodies carry `message` as a string or (validation) a string array. */
export function messageFromBody(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message: unknown }).message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string' && message) return message;
  }
  return fallback;
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return { status: 0, message: 'Cannot reach the PReCision API. Is the backend running?' };
    }
    return {
      status: error.response.status,
      message: messageFromBody(error.response.data, error.message),
    };
  }
  if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
    return error as ApiError;
  }
  return { status: 0, message: error instanceof Error ? error.message : 'Unexpected error' };
}
