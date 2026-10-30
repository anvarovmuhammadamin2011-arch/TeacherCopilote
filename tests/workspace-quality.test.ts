import assert from "node:assert/strict";
const memory = new Map<string, string>();
let fail = false;
const storage = {
  getItem: (k: string) => memory.get(k) || null,
  setItem: (k: string, v: string) => {
    if (fail) throw new Error("QuotaExceededError");
    memory.set(k, v);
  },
  removeItem: (k: string) => memory.delete(k),
  key: (n: number) => [...memory.keys()][n],
  get length() {
    return memory.size;
  },
};
Object.assign(globalThis, {
  localStorage: storage,
  sessionStorage: storage,
  window: { localStorage: storage },
});
const { useStore } = await import("../src/stores/useStore");
const { mathTopics, makeMathTasks } =
  await import("../src/features/mathematics/curriculum");
const { verifyMathTask } =
  await import("../src/features/mathematics/verification");
const { MockAIService } = await import("../src/services/ai/service");
const old = useStore.getState().db.teacher;
const a = { ...old, id: "a", email: "a@test.example" },
  b = { ...old, id: "b", email: "b@test.example" };
useStore.getState().switchTeacher(a);
assert.equal(useStore.getState().db.lessons.length, 0);
useStore.getState().mutate((d) => {
  d.materials.push({
    id: "only-a",
    title: "A",
    category: "Qaydlar",
    content: "private A",
    date: "2026-10-30",
    favorite: false,
    size: "",
  });
});
useStore.getState().switchTeacher(b);
assert.equal(useStore.getState().db.materials.length, 0);
useStore.getState().mutate((d) => {
  d.materials.push({
    id: "only-b",
    title: "B",
    category: "Qaydlar",
    content: "private B",
    date: "2026-10-30",
    favorite: false,
    size: "",
  });
});
useStore.getState().switchTeacher(a);
assert.deepEqual(
  useStore.getState().db.materials.map((x) => x.id),
  ["only-a"],
);
assert.throws(() =>
  useStore.getState().switchTeacher(b, (d) => {
    d.materials = [];
    throw new Error("registration failed");
  }),
);
assert.equal(useStore.getState().db.teacher.id, "a");
const before = JSON.stringify(useStore.getState().db);
fail = true;
assert.throws(() =>
  useStore.getState().mutate((d) => {
    d.materials = [];
  }),
);
assert.equal(JSON.stringify(useStore.getState().db), before);
assert.throws(() => useStore.getState().switchTeacher(b));
assert.equal(useStore.getState().db.teacher.id, "a");
fail = false;
await useStore.persist.rehydrate();
assert.equal(useStore.getState().db.teacher.id, "a");
useStore.getState().switchTeacher(b);
assert.deepEqual(
  useStore.getState().db.materials.map((x) => x.id),
  ["only-b"],
);
localStorage.setItem("teachercopilot-draft-v1:a:lesson", "keep A");
localStorage.setItem("teachercopilot-draft-v1:b:lesson", "remove B");
useStore.getState().reset();
assert.equal(
  localStorage.getItem("teachercopilot-draft-v1:a:lesson"),
  "keep A",
);
assert.equal(localStorage.getItem("teachercopilot-draft-v1:b:lesson"), null);
useStore.getState().switchTeacher(a);
assert.equal(useStore.getState().db.materials[0].id, "only-a");
const linear = mathTopics.find((t) => t.id === "linear")!;
for (const level of ["Oson", "O‘rta", "Murakkab", "Aralash"]) {
  const aa = makeMathTasks(linear, 30, level, 0, "7"),
    bb = makeMathTasks(linear, 30, level, 1, "7");
  for (let n = 0; n < 30; n++) {
    assert.notEqual(aa[n].prompt, bb[n].prompt);
    assert.equal(
      (aa[n].prompt.match(/\d+/g) || []).length,
      (bb[n].prompt.match(/\d+/g) || []).length,
    );
    assert.ok(Math.abs(Number(aa[n].answer) - Number(bb[n].answer)) <= 1);
    assert.equal(verifyMathTask("linear", aa[n]), true);
    assert.equal(
      verifyMathTask("linear", {
        ...aa[n],
        answer: String(Number(aa[n].answer) + 1),
      }),
      false,
    );
    assert.equal(
      verifyMathTask("linear", { ...aa[n], steps: [...aa[n].steps, "1 = 2"] }),
      false,
    );
  }
}
const ai = new MockAIService(),
  input = {
    subject: "Algebra",
    topic: "Chiziqli tenglamalar",
    grade: "7",
    duration: 45,
    count: 5,
    level: "Aralash",
    variants: 2,
    answerFormat: "steps" as const,
  };
const doc = await ai.generateDocument(input, "homework");
assert.equal(doc.tasks?.length, 10);
assert.ok(
  doc.tasks!.every((t) => t.steps.some((s) => s.includes("Tekshirish:"))),
);
const { taskDocument } =
  await import("../src/features/mathematics/taskDocument");
const items = structuredClone(doc.tasks!);
const original = items.slice(1).map((x) => JSON.stringify(x));
items[0].prompt = "2x + 1 = 9 tenglamani yeching.";
items[0].answer = "4";
items[0].steps = ["2x = 8", "x = 4", "Tekshirish: 2 × 4 + 1 = 9"];
const changed = taskDocument(input, items);
assert.ok(changed.content.includes(items[0].prompt));
assert.ok(changed.answerKey.includes("2 × 4 + 1 = 9"));
assert.deepEqual(
  items.slice(1).map((x) => JSON.stringify(x)),
  original,
);
await assert.rejects(
  ai.generateQuiz({ ...input, topic: "Kvadrat tenglamalar" }),
  /8-sinf/,
);
await assert.rejects(
  ai.generateQuiz({ ...input, subject: "Geometriya" }),
  /yo‘nalish/,
);
console.log(
  "PASS: account isolation, reload, quota rollback, isolated reset; A/B equal structures and close answers; corrupted answer and solution rejection; individual structured task edits; grade/direction guard.",
);
