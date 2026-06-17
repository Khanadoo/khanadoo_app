import { apiFetch } from "@/lib/api";
import { LoginFormData, RegisterFormData } from "@/types/forms";
import { getCSRFToken } from "@/lib/client-csrf";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "USER" | "OWNER" | "ADMIN";
}

export interface LoginRespone {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterResponse {
  success: boolean;
  user: AuthUser;
}

export interface MeResponse {
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export const authClient = {
  register(data: RegisterFormData) {
    return apiFetch<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login(data: LoginFormData) {
    return apiFetch<LoginRespone>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  me(accessToken: string) {
    return apiFetch<MeResponse>("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  refresh() {
    return apiFetch<RefreshResponse>("/api/auth/refresh", {
      method: "POST",
      headers: {
        "x-csrf-token": getCSRFToken(),
      }
    });
  },

  logout() {
    return apiFetch<LogoutResponse>("/api/auth/logout", {
      method: "POST",
      headers: {
        "x-csrf-token": getCSRFToken(),
      }
    });
  },
};
