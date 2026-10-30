import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { useStore } from "./useStore";
export function useLocalDraft<T>(
  tool: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>, string] {
  const id = useStore((s) => s.db.teacher.id || "local");
  const key = `teachercopilot-draft-v1:${id}:${tool}`;
  const read = (): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw).value : initial;
    } catch {
      return initial;
    }
  };
  const [state, setState] = useState<{ key: string; value: T; error: string }>(
    () => ({ key, value: read(), error: "" }),
  );
  useEffect(() => {
    setState({ key, value: read(), error: "" });
  }, [key]);
  const update: Dispatch<SetStateAction<T>> = (next) =>
    setState((previous) => {
      const old = previous.key === key ? previous.value : initial;
      const value =
        typeof next === "function" ? (next as (v: T) => T)(old) : next;
      let error = "";
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify({ version: 1, value }));
      } catch {
        error =
          "Qoralama qurilmaga saqlanmadi. Muhim matnni nusxalab oling va xotirada joy bo‘shating.";
      }
      return { key, value, error };
    });
  return [state.key === key ? state.value : initial, update, state.error];
}
