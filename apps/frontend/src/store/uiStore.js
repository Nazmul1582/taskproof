import { create } from "zustand";
import { persist } from "zustand/middleware";

const getDefaultTheme = () => {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
};

const useUIStore = create(
  persist(
    (set) => ({
      theme: getDefaultTheme(),
      sidebarOpen: true,
      modalOpen: null,

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === "light" ? "dark" : "light";
          if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          return { theme: newTheme };
        }),

      setTheme: (theme) => {
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        set({ theme });
      },

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      openModal: (modalName) => set({ modalOpen: modalName }),
      closeModal: () => set({ modalOpen: null }),
    }),
    {
      name: "ui-storage",
    },
  ),
);

// Initialize theme on app load
if (typeof window !== "undefined") {
  const savedTheme = localStorage.getItem("ui-storage");
  if (savedTheme) {
    try {
      const parsed = JSON.parse(savedTheme);
      if (parsed.state.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      /* empty */
    }
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
  }
}

export { useUIStore };
