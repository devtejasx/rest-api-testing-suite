import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { ApiEnvelope } from "./api.types";

/** localStorage keys shared with the settings + auth hooks. */
const SETTINGS_KEY = "rats.settings";
const TOKEN_KEY = "rats.jwt";
const REFRESH_KEY = "rats.refresh";
const USER_KEY = "rats.user";

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

/** Single in-flight refresh shared by all queued 401s. */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;
  try {
    // Use a bare axios call so we don't recurse through this interceptor.
    const res = await axios.post<ApiEnvelope<{ token: string; refreshToken: string }>>(
      `${resolveBaseUrl()}/auth/refresh`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );
    const { token, refreshToken: rotated } = res.data.data;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_KEY, rotated);
    return token;
  } catch {
    // Refresh failed — clear the session.
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error?.config ?? {};
    const status = error?.response?.status;
    const isAuthCall =
      typeof original.url === "string" && original.url.includes("/auth/");

    // Feature 7 — automatic token refresh: on a 401, try once to refresh and
    // replay the original request transparently.
    if (
      status === 401 &&
      !original._retried &&
      !isAuthCall &&
      localStorage.getItem(REFRESH_KEY)
    ) {
      original._retried = true;
      refreshInFlight = refreshInFlight ?? refreshAccessToken();
      const newToken = await refreshInFlight;
      refreshInFlight = null;
      if (newToken) {
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
        return apiClient(original);
      }
    }

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
