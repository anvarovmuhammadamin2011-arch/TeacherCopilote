import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { seed } from "@/data/seed";
import { upgradeDatabase } from "@/data/upgrade";
import type { Database } from "@/types";
interface Store {
  db: Database;
  mutate: (fn: (d: Database) => void) => void;
  reset: () => void;
}
const retired = [
  "teachercopilot-demo-v3",
  "teachercopilot-demo-v2",
  "teachercopilot-demo-v1",
];
const storage = createJSONStorage<Pick<Store, "db">>(() => ({
  getItem: (key) => {
    const current = localStorage.getItem(key);
    if (current) return current;
    for (const name of retired) {
      const value = localStorage.getItem(name);
      if (value) {
        try {
          const db = upgradeDatabase(JSON.parse(value).state.db);
          localStorage.setItem(
            key,
            JSON.stringify({ state: { db }, version: 7 }),
          );
          retired.forEach((k) => localStorage.removeItem(k));
          return localStorage.getItem(key);
        } catch {}
      }
    }
    return null;
  },
  setItem: (k, v) => localStorage.setItem(k, v),
  removeItem: (k) => localStorage.removeItem(k),
}));
export const useStore = create<Store>()(
  persist(
    (set) => ({
      db: upgradeDatabase(seed()),
      mutate: (fn) =>
        set((state) => {
          const db = structuredClone(state.db);
          fn(db);
          return { db };
        }),
      reset: () =>
        set((state) => ({
          db: {
            ...upgradeDatabase(seed()),
            teacher: state.db.teacher,
            teacherProfiles: state.db.teacherProfiles,
            classes: [],
            teacherClassAssignments: [],
            lessons: [],
            quizzes: [],
            documents: [],
            materials: [],
            events: [],
            conversations: [],
            aiUsage: [],
            legacyArchive: state.db.legacyArchive,
            preferences: state.db.preferences,
          },
        })),
    }),
    {
      name: "teachercopilot-teacher-v4",
      version: 7,
      storage,
      partialize: (s) => ({ db: s.db }),
      migrate: (s) => ({ db: upgradeDatabase((s as Store).db) }),
    },
  ),
);
