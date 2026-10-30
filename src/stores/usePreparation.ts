import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useStore } from "./useStore";
import { mathDirections } from "@/features/workspace/subjects";
export interface PreparationContext {
  subject: string;
  grade: string;
  classId: string;
  topic: string;
  language: string;
  level: string;
  count: number;
  variants: number;
  answerFormat: "answer" | "steps";
  duration: number;
  instructions: string;
}
export const preparationDefaults: PreparationContext = {
  subject: "Matematika",
  grade: "8",
  classId: "",
  topic: "",
  language: "O‘zbek",
  level: "O‘rta",
  count: 5,
  variants: 1,
  answerFormat: "steps",
  duration: 45,
  instructions: "",
};
interface State {
  contexts: Record<string, PreparationContext>;
  update: (patch: Partial<PreparationContext>) => void;
}
export const usePreparation = create<State>()(
  persist(
    (set) => ({
      contexts: {},
      update: (patch) => {
        const key = useStore.getState().db.teacher.id || "local";
        set((s) => ({
          contexts: {
            ...s.contexts,
            [key]: { ...preparationDefaults, ...s.contexts[key], ...patch },
          },
        }));
      },
    }),
    {
      name: "teachercopilot-preparation-v1",
      version: 2,
      partialize: (s) => ({ contexts: s.contexts }),
      migrate: (raw) => ({
        contexts: Object.fromEntries(
          Object.entries((raw as State)?.contexts || {}).map(([id, c]) => [
            id,
            {
              ...preparationDefaults,
              ...c,
              subject: mathDirections.includes(c.subject)
                ? c.subject
                : "Matematika",
              topic: mathDirections.includes(c.subject) ? c.topic : "",
            },
          ]),
        ),
      }),
    },
  ),
);
export function usePreparationContext() {
  const id = useStore((s) => s.db.teacher.id || "local");
  return usePreparation((s) => s.contexts[id]) || preparationDefaults;
}
