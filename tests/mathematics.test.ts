import assert from "node:assert/strict";
import { writeFile, mkdir } from "node:fs/promises";
const memory = new Map<string, string>();
const storage = {
  getItem: (k: string) => memory.get(k) || null,
  setItem: (k: string, v: string) => memory.set(k, v),
  removeItem: (k: string) => memory.delete(k),
};
Object.assign(globalThis, {
  localStorage: storage,
  sessionStorage: storage,
  window: { localStorage: storage },
});
const { mathTopics, makeMathTasks } =
  await import("../src/features/mathematics/curriculum");
function value(s: string) {
  if (s.includes("/")) {
    const [a, b] = s.split("/").map(Number);
    return a / b;
  }
  return Number(s);
}
function expected(id: string, p: string): string | number {
  let a: number, b: number, c: number, d: number, m: RegExpMatchArray | null;
  const nums = (p.match(/\d+/g) || []).map(Number);
  switch (id) {
    case "arithmetic":
      [a, b, c] = nums;
      return a + b * c;
    case "multiply":
      [a, b] = nums;
      return a * b;
    case "fractions":
    case "fraction-subtract":
    case "fraction-multiply":
      [a, b, c, d] = nums;
      return id === "fractions"
        ? a / b + c / d
        : id === "fraction-subtract"
          ? a / b - c / d
          : (a / b) * (c / d);
    case "percent":
      [a, b] = nums;
      return (a * b) / 100;
    case "ratio":
      [a, b, c] = nums;
      return (a * b) / c;
    case "linear":
      if ((m = p.match(/^(\d+)\(x \+ (\d+)\) − (\d+)x = (\d+)/))) {
        [, a, b, c, d] = m.map(Number);
        return (d - a * b) / (a - c);
      }
      if ((m = p.match(/^(\d+)x \+ (\d+) = (\d+)x \+ (\d+)/))) {
        [, a, b, c, d] = m.map(Number);
        return (d - b) / (a - c);
      }
      [a, b, c] = nums;
      return (c - b) / a;
    case "quadratic":
      [b, c] = nums;
      return `${(b - Math.sqrt(b * b - 4 * c)) / 2}; ${(b + Math.sqrt(b * b - 4 * c)) / 2}`;
    case "powers":
      [a, b, c, d] = nums;
      return `${a}^${b + d}`;
    case "rectangle":
      [a, b] = nums;
      return `${a * b} cm²`;
    case "triangle":
      [a, b] = nums;
      return `${180 - a - b}°`;
    case "pythagoras":
      [a, b] = nums;
      return `${Math.sqrt(a * a + b * b)} cm`;
    case "function":
      [a, b, c] = nums;
      return a * c + b;
    case "trig":
      [a, b, c] = nums;
      return p.includes("cos α") ? b / c : a / c;
    case "probability":
      [a, b] = nums;
      return a / (a + b);
    case "derivative":
      [a, b] = nums;
      return `${a * b}x^${b - 1}`;
    default:
      throw Error(id);
  }
}
let checked = 0;
for (const topic of mathTopics)
  for (const level of ["Oson", "O‘rta", "Murakkab", "Aralash"])
    for (let variant = 0; variant < 4; variant++) {
      const tasks = makeMathTasks(topic, 30, level, variant, "8");
      assert.equal(tasks.length, 30);
      assert.equal(new Set(tasks.map((t) => t.prompt)).size, 30, topic.id);
      for (const t of tasks) {
        const exp = expected(topic.id, t.prompt);
        if (typeof exp === "number")
          assert.ok(
            Math.abs(value(t.answer) - exp) < 1e-9,
            `${topic.id}: ${t.prompt}: ${t.answer} != ${exp}`,
          );
        else assert.equal(t.answer, exp, t.prompt);
        assert.equal(new Set([t.answer, ...t.wrong]).size, 4, topic.id);
        assert.ok(!/NaN|Infinity|undefined/.test(JSON.stringify(t)));
        assert.ok(t.steps.length);
        checked++;
      }
    }
const { seed } = await import("../src/data/seed");
const { upgradeDatabase } = await import("../src/data/upgrade");
const { usePreparation } = await import("../src/stores/usePreparation");
const { useStore } = await import("../src/stores/useStore");
const db = seed();
db.lessons.push({ ...db.lessons[0], id: "english", subject: "Ingliz tili" });
db.classes.push({
  id: "eng",
  name: "8-E",
  subject: "Ingliz tili",
  description: "",
  year: "2026–2027",
});
db.teacherClassAssignments.push({
  id: "english-link",
  teacherId: db.teacher.id!,
  classId: "eng",
  subject: "Ingliz tili",
  weeklyHours: 4,
  archived: false,
});
const migrated = upgradeDatabase(db);
assert.ok(migrated.legacyArchive?.lessons.some((x) => x.id === "english"));
assert.ok(!migrated.lessons.some((x) => x.subject === "Ingliz tili"));
assert.ok(migrated.classes.find((x) => x.id === "eng")?.archived);
assert.deepEqual(upgradeDatabase(migrated), migrated);
usePreparation
  .getState()
  .update({
    subject: "Algebra",
    topic: "Chiziqli tenglamalar",
    count: 5,
    variants: 2,
    answerFormat: "steps",
    level: "Aralash",
  });
assert.equal(
  usePreparation.getState().contexts[useStore.getState().db.teacher.id!].count,
  5,
);
const { MockAIService, questionTypes } =
  await import("../src/services/ai/service");
const { quizText, quizKeys } =
  await import("../src/features/mathematics/assessment");
const ai = new MockAIService();
const input = {
  topic: "Chiziqli tenglamalar",
  subject: "Algebra",
  grade: "8",
  duration: 45,
  count: 5,
  variants: 2,
  level: "Aralash",
  answerFormat: "steps" as const,
};
const doc = await ai.generateDocument(input, "homework");
assert.equal((doc.content.match(/^\d+\. /gm) || []).length, 10);
assert.ok(!doc.content.includes("Javob:"));
assert.ok(doc.answerKey.includes("Tekshirish:"));
assert.equal((doc.content.match(/VARIANT/g) || []).length, 2);
const onlyAnswers = await ai.generateDocument(
  { ...input, answerFormat: "answer" },
  "homework",
);
assert.ok(!onlyAnswers.answerKey.includes("Tekshirish:"));
assert.equal((onlyAnswers.answerKey.match(/^\d+\. /gm) || []).length, 10);
const conspect = await ai.generateDocument(input, "conspect");
assert.ok(conspect.content.includes("Yechilgan misol"));
assert.equal((conspect.content.match(/^\d+\. .*tenglamani/gm) || []).length, 5);
assert.ok(conspect.answerKey.includes("1."));
for (const topic of mathTopics) {
  const qs = await ai.generateQuiz({
    ...input,
    topic: topic.title,
    subject: topic.subject,
    grade: String(Math.max(8, topic.from)),
    count: 7,
    questionTypes,
  });
  assert.equal(qs.length, 7);
  assert.deepEqual(
    qs.map((x) => x.type),
    questionTypes,
  );
  assert.equal(qs[0].options[qs[0].correct], qs[0].answer);
  assert.equal(qs[4].pairs?.length, 3, topic.id);
  assert.equal(new Set(qs[4].pairs?.map((x) => x.right)).size, 3, topic.id);
  assert.ok(qs.every((x) => x.solution));
}
const qa = await ai.generateQuiz(input),
  qb = await ai.generateQuiz({ ...input, variant: 1 });
assert.ok(!qa.some((a) => qb.some((b) => a.text === b.text)));
const quiz = {
  id: "qa",
  title: input.topic,
  subject: input.subject,
  grade: "8",
  classId: "",
  status: "Tayyor",
  questions: qa,
  variants: [
    { label: "A", questions: qa },
    { label: "B", questions: qb },
  ],
  time: 45,
  date: "2026-10-30",
  answerFormat: "steps" as const,
};
const sheet = quizText(quiz, false),
  keys = quizKeys(quiz);
assert.ok(!sheet.includes("Tekshirish:"));
assert.ok(!sheet.includes("JAVOB KALITI"));
assert.ok(keys.includes("Tekshirish:"));
assert.ok(keys.includes("B VARIANT"));
assert.ok(
  !quizKeys({ ...quiz, answerFormat: "answer" }).includes("Tekshirish:"),
);
for (const duration of [30, 45, 60, 90]) {
  const plan = await ai.generateLesson({ ...input, duration });
  assert.equal(
    plan.reduce((a, b) => a + b.minutes, 0),
    duration,
  );
  assert.equal(
    (
      plan
        .find((s) => s.title === "Amaliy mashqlar")!
        .content.match(/^\d+\./gm) || []
    ).length,
    5,
  );
}
await assert.rejects(
  ai.generateDocument({ ...input, topic: "unsupported astronomy" }, "homework"),
  /shablon/,
);
await assert.rejects(ai.generateQuiz({ ...input, count: NaN }));
await assert.rejects(ai.generateQuiz({ ...input, count: 31 }));
const { classSchema, professionalSchema } =
  await import("../src/features/onboarding/schema");
assert.equal(classSchema.safeParse({ subject: "Ingliz tili" }).success, false);
assert.equal(
  professionalSchema.safeParse({ primarySubject: "Ingliz tili" }).success,
  false,
);
await mkdir(".qa/exports", { recursive: true });
await writeFile(
  ".qa/exports/fixture.json",
  JSON.stringify({ sheet, keys, doc, conspect }, null, 2),
);
console.log(
  `PASS: ${checked} independently calculated answers across 17 topics, 4 difficulty levels, 4 variants; 7 question types for every topic; separate answer exports; 2x5 exercises; answer-only/steps; exact lesson durations; math-only migration and validation.`,
);
