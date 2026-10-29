import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser } from "@/types";
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  remember: boolean;
  postLoginPath: string | null;
  logout: () => void;
  createSession: (
    user: AuthUser,
    remember?: boolean,
    postLoginPath?: string,
  ) => void;
}
const storage = createJSONStorage<
  Pick<AuthState, "user" | "isAuthenticated" | "remember">
>(() => ({
  getItem: (key) => localStorage.getItem(key) || sessionStorage.getItem(key),
  setItem: (key, value) => {
    const parsed = JSON.parse(value) as { state: { remember: boolean } };
    if (parsed.state.remember) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
}));
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      remember: true,
      postLoginPath: null,
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          remember: true,
          postLoginPath: null,
        }),
      createSession: (user, remember = true, postLoginPath) =>
        set({
          user,
          isAuthenticated: true,
          remember,
          postLoginPath: postLoginPath || null,
        }),
    }),
    {
      name: "teachercopilot-session-v1",
      version: 3,
      migrate: () => ({ user: null, isAuthenticated: false, remember: true }),
      storage,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        remember: state.remember,
      }),
    },
  ),
);
