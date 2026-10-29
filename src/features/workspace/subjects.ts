export const teachingSubjects = ["Matematika", "Ingliz tili"];
export function normalizeSubject(subject?: string) {
  return /ingliz|english/i.test(subject || "") ? "Ingliz tili" : "Matematika";
}
export const isSupportedSubject = (subject?: string) =>
  /^(matematika|algebra|geometriya|ingliz tili|english)$/i.test(
    (subject || "").trim(),
  );
export const documentPath = (kind: string) =>
  kind === "conspect"
    ? "conspects"
    : kind === "exercise"
      ? "exercises"
      : "homework";
export const documentLabel = (kind: string) =>
  kind === "conspect"
    ? "Konspekt"
    : kind === "exercise"
      ? "Mashq"
      : "Uy vazifasi";
