import { useStore } from "@/stores/useStore";
import type { Lesson, Quiz } from "@/types";
export async function delay<T>(value: T, ms = 400): Promise<T> {
  await new Promise((r) => setTimeout(r, ms));
  return value;
}
export const mockRepository = {
  getLessons: () => delay(useStore.getState().db.lessons),
  createLesson: async (l: Lesson) => {
    useStore.getState().mutate((d) => d.lessons.unshift(l));
    return delay(l);
  },
  updateLesson: async (l: Lesson) => {
    useStore.getState().mutate((d) => {
      d.lessons = d.lessons.map((x) => (x.id === l.id ? l : x));
    });
    return delay(l);
  },
  deleteLesson: async (id: string) => {
    useStore.getState().mutate((d) => {
      d.lessons = d.lessons.filter((x) => x.id !== id);
    });
  },
  getQuizzes: () => delay(useStore.getState().db.quizzes),
  createQuiz: async (q: Quiz) => {
    useStore.getState().mutate((d) => d.quizzes.unshift(q));
    return delay(q);
  },
};
