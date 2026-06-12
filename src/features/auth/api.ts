import { api, tokenStorage } from "@/lib/api/client";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "./types";

/** Một số backend trả về { user, accessToken, refreshToken }, một số khác lồng trong { data: ... } */
function unwrap<T>(data: unknown): T {
  if (data && typeof data === "object" && "data" in (data as Record<string, unknown>)) {
    return (data as { data: T }).data;
  }
  return data as T;
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const res = await api.post("/auth/login", payload);
  const body = unwrap<AuthResponse>(res.data);
  tokenStorage.set(body.accessToken, body.refreshToken);
  return body;
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await api.post("/auth/register", payload);
  const body = unwrap<AuthResponse>(res.data);
  if (body?.accessToken) tokenStorage.set(body.accessToken, body.refreshToken);
  return body;
}

export async function fetchMe(): Promise<AuthUser> {
  const res = await api.get("/auth/me");
  return unwrap<AuthUser>(res.data);
}

export async function logoutRequest(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch {
    /* ignore — vẫn xoá token ở client */
  } finally {
    tokenStorage.clear();
  }
}
