import type { DocumentTask, GenerationSnapshot } from "@/types";
export function taskDocument(
  parameters: GenerationSnapshot,
  tasks: DocumentTask[],
) {
  const content: string[] = [],
    answerKey: string[] = [];
  for (let variant = 0; variant < (parameters.variants || 1); variant++) {
    const items = tasks
      .filter((t) => t.variant === variant)
      .sort((a, b) => a.position - b.position);
    const label = String.fromCharCode(65 + variant) + " VARIANT";
    content.push(
      `${label}\n${parameters.subject} · ${parameters.grade}-sinf · ${parameters.topic}\nIsm: _____________________  Sana: __________\nQiyinlik: ${parameters.level || "O‘rta"}\n\nMashqlar\n` +
        items
          .map(
            (t, n) =>
              `${n + 1}. ${t.prompt}\nYechim: ________________________________________`,
          )
          .join("\n\n"),
    );
    answerKey.push(
      label +
        "\n" +
        items
          .map(
            (t, n) =>
              `${n + 1}. ` +
              (parameters.answerFormat === "answer"
                ? t.answer
                : t.steps.join("\n") + "\nJavob: " + t.answer),
          )
          .join("\n\n"),
    );
  }
  return {
    content: content.join("\n\n\f\n"),
    answerKey:
      answerKey.join("\n\n\f\n") +
      (parameters.instructions
        ? "\n\nUstoz qaydi (avtomatik bajarilmagan): " + parameters.instructions
        : ""),
  };
}
