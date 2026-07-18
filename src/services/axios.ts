import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { ApiEnvelope } from "./api.types";

/** localStorage keys shared with the settings hook. */
const SETTINGS_KEY = "rats.settings";
const TOKEN_KEY = "rats.jwt";

/** The compile-time default, overridable at runtime via Settings. */
export const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

/** Resolve the active base URL: runtime setting first, then env default. */
function resolveBaseUrl(): string {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { apiUrl?: string };
      if (parsed.apiUrl) return parsed.apiUrl;
    }
  } catch {
    /* ignore malformed settings */
  }
  return DEFAULT_API_BASE_URL;
}

/**
 * Pre-configured Axios instance. Every request resolves its base URL and auth
 * token at call time, so changing the API URL in Settings takes effect without
 * a page reload.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = resolveBaseUrl();
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Surface a clean, consistent message to the query layer.
    const message =
      error?.response?.data?.message ??
      error?.message ??
      "Request failed. Is the backend running?";
    return Promise.reject(new Error(message));
  },
);

/** GET a resource and unwrap the `{ success, data }` envelope. */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<ApiEnvelope<T>>(url, config);
  return res.data.data;
}

/** POST a resource and unwrap the `{ success, data }` envelope. */
export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.post<ApiEnvelope<T>>(url, body, config);
  return res.data.data;
}
