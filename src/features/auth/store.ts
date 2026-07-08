import { create } from "zustand";
import { tokenStorage } from "@/lib/api/client";
import { fetchMe, loginRequest, logoutRequest, registerRequest } from "./api";
import type { AuthUser, LoginPayload, RegisterPayload } from "./types";

interface AuthState {
  user: AuthUser | null;
  status: "idle" | "loading" | "authenticated" | "guest";
  error: string | null;
  hydrate: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: "idle",
  error: null,

  clearError: () => set({ error: null }),

  async hydrate() {
    if (get().status === "loading" || get().status === "authenticated") return;
    const token = tokenStorage.getAccess() || tokenStorage.getRefresh();
    if (!token) {
      set({ status: "guest", user: null });
      return;
    }
    set({ status: "loading" });
    try {
      const user = await fetchMe();
      set({ user, status: "authenticated", error: null });
    } catch {
      tokenStorage.clear();
      set({ user: null, status: "guest" });
    }
  },

  async login(payload) {
    set({ status: "loading", error: null });
    try {
      const res = await loginRequest(payload);
      set({ user: res.user, status: "authenticated", error: null });
    } catch (err) {
      set({
        status: "guest",
        error: err instanceof Error ? err.message : "Đăng nhập thất bại",
      });
      throw err;
    }
  },

  async register(payload) {
    set({ status: "loading", error: null });
    try {
      const res = await registerRequest(payload);
      if (res?.user && res?.accessToken) {
        set({ user: res.user, status: "authenticated", error: null });
      } else {
        set({ status: "guest", error: null });
      }
    } catch (err) {
      set({
        status: "guest",
        error: err instanceof Error ? err.message : "Đăng ký thất bại",
      });
      throw err;
    }
  },

  async logout() {
    await logoutRequest();
    set({ user: null, status: "guest", error: null });
  },
}));

/** Tiện ích: gọi trong component gốc để khôi phục phiên đăng nhập (nếu có token) */
export function useHydrateAuth() {
  return useAuthStore((s) => s.hydrate);
}
