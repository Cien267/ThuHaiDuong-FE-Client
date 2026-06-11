import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

/** Chuẩn lỗi API từ backend .NET */
export interface ApiErrorShape {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export class ApiRequestError extends Error implements ApiErrorShape {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const tokenStorage = {
  getAccess(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefresh(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  set(accessToken: string, refreshToken?: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

/**
 * Base URL:
 * - Mặc định "/api" → đi qua proxy Vite tới http://localhost:5129 (xem vite.config.ts).
 * - Đặt VITE_API_BASE_URL (vd: http://localhost:5129/api) để trình duyệt gọi thẳng backend.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// Gắn Bearer token (nếu có) vào mọi request
api.interceptors.request.use(config => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh token khi 401 (single-flight, retry 1 lần)
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
    const data = res.data as { accessToken?: string; refreshToken?: string };
    if (data?.accessToken) {
      tokenStorage.set(data.accessToken, data.refreshToken ?? refreshToken);
      return data.accessToken;
    }
    return null;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      tokenStorage.getRefresh()
    ) {
      original._retry = true;
      refreshing ??= refreshAccessToken().finally(() => {
        refreshing = null;
      });
      const newToken = await refreshing;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(toApiError(error));
  },
);

export function toApiError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) return error;
  const e = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
  if (e && e.isAxiosError) {
    const statusCode = e.response?.status ?? 0;
    const message = e.response?.data?.message || e.message || "Đã có lỗi xảy ra";
    return new ApiRequestError(message, statusCode, e.response?.data?.errors);
  }
  return new ApiRequestError(error instanceof Error ? error.message : "Đã có lỗi xảy ra", 0);
}

/** Lỗi mạng / backend không chạy / proxy lỗi → có thể fallback dữ liệu mẫu */
export function isBackendUnavailable(error: unknown): boolean {
  const e = error instanceof ApiRequestError ? error : toApiError(error);
  return e.statusCode === 0 || e.statusCode >= 500;
}
