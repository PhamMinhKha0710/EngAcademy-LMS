import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  authApi,
  LoginRequest,
  RegisterRequest,
  User,
  AuthResponse,
} from "../services/api/authApi";

const clearExamSessionCache = () => {
  if (typeof sessionStorage === "undefined") return;
  const keys = Object.keys(sessionStorage);
  for (const key of keys) {
    if (
      key.startsWith("exam_result_") ||
      key.startsWith("exam_submit_success_")
    ) {
      sessionStorage.removeItem(key);
    }
  }
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  fetchCurrentUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          clearExamSessionCache();
          const response: AuthResponse = await authApi.login(credentials);

          const user: User = {
            id: response.id,
            username: response.username,
            email: response.email,
            fullName: response.username,
            roles: response.roles,
          };

          set({
            user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          await get().fetchCurrentUser();
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Đăng nhập thất bại",
            isLoading: false,
          });
          throw error;
        }
      },

      loginWithGoogle: async (accessToken: string) => {
        set({ isLoading: true, error: null });
        try {
          clearExamSessionCache();
          const response = await authApi.loginWithGoogle(accessToken);

          const user: User = {
            id: response.id,
            username: response.username,
            email: response.email,
            fullName: response.username,
            roles: response.roles,
          };

          set({
            user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          await get().fetchCurrentUser();
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Đăng nhập Google thất bại",
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          clearExamSessionCache();
          const response: AuthResponse = await authApi.register(data);

          const user: User = {
            id: response.id,
            username: response.username,
            email: response.email,
            fullName: data.fullName,
            roles: response.roles,
          };

          set({
            user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          await get().fetchCurrentUser();
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Đăng ký thất bại",
            isLoading: false,
          });
          throw error;
        }
      },

      fetchCurrentUser: async () => {
        try {
          const user = await authApi.getCurrentUser();
          set({ user });
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      },

      logout: () => {
        clearExamSessionCache();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      setUser: (user: User | null) => set({ user }),
    }),
    {
      name: "auth-storage",
      // Only persist what's safe: user profile, auth state, and short-lived access token.
      // NEVER persist refreshToken to localStorage — it's XSS-extractable.
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Re-export User type for convenience
export type { User } from "../services/api/authApi";
