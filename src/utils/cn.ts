import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export const uid = () =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Array.from(crypto.getRandomValues(new Uint8Array(16)), (n) =>
        n.toString(16).padStart(2, "0"),
      ).join("");
export const today = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tashkent" }).format(
    new Date(),
  );
export const months = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];
export const dateLabel = (date: string) => {
  const d = new Date(date + "T12:00:00");
  return `${d.getDate()}-${months[d.getMonth()]}`;
};
export const monthLabel = (date: Date) =>
  `${months[date.getMonth()]} ${date.getFullYear()}`;
export const endTime = (time: string, minutes = 45) => {
  const [h, m] = time.split(":").map(Number);
  const n = h * 60 + m + minutes;
  return `${String(Math.floor(n / 60) % 24).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
};
export const average = (values: number[]) =>
  values.length
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : 0;
export const downloadText = (name: string, text: string) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
};
