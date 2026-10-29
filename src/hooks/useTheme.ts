import { useEffect, useState } from "react";
import { useStore } from "@/stores/useStore";
export function useTheme() {
  const preference = useStore((s) => s.db.preferences.theme);
  const mutate = useStore((s) => s.mutate);
  const [system, setSystem] = useState(
    () => matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const listener = () => setSystem(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);
  const dark = preference === "dark" || (preference === "system" && system);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return {
    dark,
    toggle: () =>
      mutate((d) => {
        d.preferences.theme = dark ? "light" : "dark";
      }),
  };
}
