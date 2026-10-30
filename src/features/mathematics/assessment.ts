import type { Quiz, Question } from "@/types";
export function answerText(q: Question) {
  if (q.type === "Moslashtirish")
    return (q.pairs || []).map((p) => p.left + " → " + p.right).join("; ");
  if (q.type === "Bir nechta javob")
    return (q.correctAnswers || [])
      .map((n) => String.fromCharCode(65 + n) + ". " + q.options[n])
      .join("; ");
  return q.options.length
    ? String.fromCharCode(65 + q.correct) + ". " + q.options[q.correct]
    : q.answer;
}
export function quizText(q: Quiz, keys: boolean) {
  const variants = q.variants?.length
    ? q.variants
    : [{ label: "A", questions: q.questions }];
  return (
    `${q.subject} · ${q.grade}-sinf · ${q.time} daqiqa · ${q.language || "O‘zbek"}\nIsm: __________________  Sana: __________\n\n` +
    variants
      .map(
        (v) =>
          `${v.label} VARIANT\n\n` +
          v.questions
            .map(
              (x, i) =>
                `${i + 1}. ${x.text} (${x.points} ball)\n` +
                (x.type === "Moslashtirish"
                  ? (x.pairs || [])
                      .map(
                        (p, n) =>
                          `${n + 1}. ${p.left}    ${String.fromCharCode(65 + n)}. ${(x.pairs || [])[(n + 1) % (x.pairs?.length || 1)]?.right}`,
                      )
                      .join("\n")
                  : x.options
                      .map((o, n) => `${String.fromCharCode(65 + n)}. ${o}`)
                      .join("\n")) +
                (!x.options.length && x.type !== "Moslashtirish"
                  ? "\nJavob: __________________________________________________"
                  : ""),
            )
            .join("\n\n") +
          (keys
            ? "\n\nJAVOB KALITI\n" +
              v.questions.map((x, i) => `${i + 1}. ${answerText(x)}`).join("\n")
            : ""),
      )
      .join("\n\n\f\n")
  );
}
export function quizKeys(q: Quiz) {
  return (
    q.variants?.length ? q.variants : [{ label: "A", questions: q.questions }]
  )
    .map(
      (v) =>
        `${v.label} VARIANT — USTOZ JAVOBLARI\n\n` +
        v.questions
          .map(
            (x, i) =>
              `${i + 1}. ${answerText(x)}` +
              (q.answerFormat !== "answer" && x.solution
                ? "\n" + x.solution
                : ""),
          )
          .join("\n\n"),
    )
    .join("\n\n\f\n");
}
