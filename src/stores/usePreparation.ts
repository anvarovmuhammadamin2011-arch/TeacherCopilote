import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useStore } from "./useStore";
import { normalizeSubject } from "@/features/workspace/subjects";
export interface PreparationContext {
  subject: string;
  grade: string;
  classId: string;
  topic: string;
  language: string;
}
interface State {
  contexts: Record<string, PreparationContext>;
  update: (patch: Partial<PreparationContext>) => void;
}
const defaultContext = (): PreparationContext => {
  const db = useStore.getState().db;
  return {
    subject: normalizeSubject(db.teacher.subject),
    grade: "8",
    classId: "",
    topic: "",
    language: "O‘zbek",
  };
};
export const usePreparation = create<State>()(
  persist(
    (set) => ({
      contexts: {},
      update: (patch) => {
        const key = useStore.getState().db.teacher.id || "local";
        set((s) => ({
          contexts: {
            ...s.contexts,
            [key]: { ...(s.contexts[key] || defaultContext()), ...patch },
          },
        }));
      },
    }),
    {
      name: "teachercopilot-preparation-v1",
      partialize: (s) => ({ contexts: s.contexts }),
    },
  ),
);
export function usePreparationContext() {
  const id = useStore((s) => s.db.teacher.id || "local");
  const teacherSubject = useStore((s) => s.db.teacher.subject);
  const context = usePreparation((s) => s.contexts[id]);
  return (
    context || {
      subject: normalizeSubject(teacherSubject),
      grade: "8",
      classId: "",
      topic: "",
      language: "O‘zbek",
    }
  );
}
