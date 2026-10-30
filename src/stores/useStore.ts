import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { seed } from "@/data/seed";
import { upgradeDatabase } from "@/data/upgrade";
import type { Database, Teacher } from "@/types";
type Workspace = Omit<Database, "teacher" | "teacherProfiles">;
function workspace(db: Database): Workspace {
  const { teacher: _teacher, teacherProfiles: _profiles, ...records } = db;
  return records;
}
interface Store {
  workspaces: Record<string, Workspace>;
  switchTeacher: (
    teacher: Teacher,
    initialize?: (db: Database) => void,
  ) => void;
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
            JSON.stringify({ state: { db }, version: 8 }),
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
    (set, get) => ({
      workspaces: {},
      switchTeacher: (teacher, initialize) => {
        const state = get();
        const current = state.db.teacher.id || "local";
        if (current === teacher.id) {
          state.mutate((d) => {
            d.teacher = teacher;
            initialize?.(d);
          });
          return;
        }
        const workspaces = {
          ...state.workspaces,
          [current]: workspace(state.db),
        };
        const empty = workspace(upgradeDatabase(seed()));
        Object.assign(empty, {
          classes: [],
          teacherClassAssignments: [],
          lessons: [],
          quizzes: [],
          documents: [],
          materials: [],
          events: [],
          aiUsage: [],
          conversations: [],
          legacyArchive: undefined,
        });
        const db = structuredClone({
          ...(workspaces[teacher.id || "local"] || empty),
          teacher,
          teacherProfiles: state.db.teacherProfiles,
        });
        initialize?.(db);
        localStorage.setItem(
          "teachercopilot-teacher-v4",
          JSON.stringify({ version: 8, state: { db, workspaces } }),
        );
        set({ db, workspaces });
      },
      db: upgradeDatabase(seed()),
      mutate: (fn) =>
        set((state) => {
          const db = structuredClone(state.db);
          fn(db);
          // Verify persistence before publishing the changed state to subscribers.
          localStorage.setItem(
            "teachercopilot-teacher-v4",
            JSON.stringify({
              version: 8,
              state: { db, workspaces: state.workspaces },
            }),
          );
          return { db };
        }),
      reset: () => {
        const id = get().db.teacher.id || "local";
        get().mutate((db) => {
          Object.assign(db, {
            classes: [],
            teacherClassAssignments: [],
            lessons: [],
            quizzes: [],
            documents: [],
            materials: [],
            events: [],
            conversations: [],
            aiUsage: [],
          });
        });
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key?.startsWith(`teachercopilot-draft-v1:${id}:`))
            localStorage.removeItem(key);
        }
      },
    }),
    {
      name: "teachercopilot-teacher-v4",
      version: 8,
      storage,
      partialize: (s) => ({ db: s.db, workspaces: s.workspaces }),
      migrate: (s) => ({
        db: upgradeDatabase((s as Store).db),
        workspaces: (s as Store).workspaces || {},
      }),
    },
  ),
);
