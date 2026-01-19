import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthResponse } from '../types';
import { authApi } from '../services/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuth: (data: AuthResponse) => void;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
  refreshAuth: () => Promise<boolean>;
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

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          if (response.data) {
            set({
              user: response.data.user,
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register({ name, email, password });
          if (response.data) {
            set({
              user: response.data.user,
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        // Call API to invalidate token
        const token = get().accessToken;
        if (token) {
          authApi.logout().catch(console.error);
        }
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setAuth: (data: AuthResponse) => {
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      refreshAuth: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) return false;

        try {
          const response = await authApi.refresh(refreshToken);
          if (response.data) {
            set({
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
            });
            return true;
          }
          return false;
        } catch {
          get().logout();
          return false;
        }
      },
    }),
    {
      name: 'recipe-platform-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
