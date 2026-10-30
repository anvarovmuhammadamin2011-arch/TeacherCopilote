export const teachingSubjects = ["Matematika"];
export const mathDirections = ["Matematika", "Algebra", "Geometriya"];
export const normalizeSubject = (_subject?: string) => "Matematika";
export const isSupportedSubject = (subject?: string) =>
  /^(matematika|algebra|geometriya)$/i.test((subject || "").trim());
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
