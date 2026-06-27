import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/api";
import { queryClient } from "../lib/queryClient";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, token) => {
        queryClient.clear();
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        queryClient.clear();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          const response = await authService.getMe();
          set({
            user: response.data.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          // eslint-disable-next-line no-unused-vars
        } catch (error) {
          queryClient.clear();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token }),
    },
  ),
);

export { useAuthStore };
