import axios, { type AxiosInstance } from "axios";

/**
 * Pre-configured Axios instance.
 *
 * The backend does not exist yet, so no real requests are made today — every
 * service under `src/services` currently resolves from the mock data layer.
 * When the API is ready, point `VITE_API_BASE_URL` at it and swap the mock
 * resolvers in each service for real `apiClient` calls; the React Query hooks
 * and components will not need to change.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach auth headers / correlation ids here later.
apiClient.interceptors.request.use((config) => {
  // Example placeholder: config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — normalize errors for the whole app.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Central place to log / transform API errors.
    return Promise.reject(error);
  },
);

/** Simulate network latency for the mock layer so loading states are visible. */
export function mockDelay<T>(data: T, ms = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}
