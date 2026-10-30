import MaterialActions from "@/features/mathematics/MaterialActions";
import SeparateExports from "@/features/mathematics/SeparateExports";
import { usePreparation, usePreparationContext } from "@/stores/usePreparation";
import MathTopicSuggestions from "@/features/mathematics/MathTopicSuggestions";
import { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Sparkles,
  Save,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/stores/useStore";
import { aiService, questionTypes, type AIInput } from "@/services/ai/service";
import { teacherClasses } from "@/services/api/onboardingRepository";
import { subjects } from "@/data/seed";
import { uid, today } from "@/utils/cn";
import type { Quiz, Question } from "@/types";
import {
  Card,
  PageHead,
  Button,
  Field,
  DemoNote,
  Empty,
  SearchInput,
  Badge,
  Confirm,
} from "@/components/common";
import {
  answerText,
  quizText,
  quizKeys,
} from "@/features/mathematics/assessment";
export function Quizzes() {
  const { db, mutate } = useStore();
  const [search, setSearch] = useState("");
  const list = db.quizzes.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHead
        title="Saqlangan testlar"
        description="Savollar, variantlar va javob kalitlari."
        action={
          <Button asChild>
            <Link to="/teacher/quizzes/create">Yangi test yaratish</Link>
          </Button>
        }
      />
      <SearchInput value={search} onChange={setSearch} />
      <div className="resource-grid">
        {list.map((q) => (
          <Card key={q.id}>
            <Badge>{q.status}</Badge>
            <h2>{q.title}</h2>
            <p>
              {q.subject} · {q.questions.length} savol ·{" "}
              {q.variants?.length || 1} variant
            </p>
            <div className="button-row">
              <Button asChild>
                <Link to={"/teacher/quizzes/" + q.id}>Ochish</Link>
              </Button>
              <Confirm
                onConfirm={() =>
                  mutate((d) => {
                    d.quizzes = d.quizzes.filter((x) => x.id !== q.id);
                  })
                }
              >
                <Button variant="ghost" aria-label={q.title + "ni o‘chirish"}>
                  <Trash2 size={16} />
                </Button>
              </Confirm>
            </div>
          </Card>
        ))}
      </div>
      {!list.length && <Empty title="Hozircha test saqlanmagan" />}
    </>
  );
}
const blank = (type = "Variantli"): Question => ({
  id: uid(),
  text: "",
  type,
  options: ["", "", "", ""],
  correct: 0,
  correctAnswers: [0],
  answer: "",
  points: 1,
  pairs: [
    { left: "", right: "" },
    { left: "", right: "" },
  ],
});
export function QuizCreate({
  integrated = false,
  assessment = false,
}: {
  integrated?: boolean;
  assessment?: boolean;
}) {
  const context = usePreparationContext();
  const { id } = useParams();
  const [params] = useSearchParams();
  const { db, mutate } = useStore();
  const existing = db.quizzes.find((q) => q.id === id);
  const navigate = useNavigate();
  const classes = teacherClasses(db);
  const [form, setForm] = useState({
    subject:
      existing?.subject || (integrated ? context.subject : db.teacher.subject),
    grade:
      existing?.grade ||
      (integrated ? context.grade : String(classes[0]?.grade || 8)),
    classId:
      existing?.classId ||
      (integrated ? context.classId : classes[0]?.id) ||
      "",
    topic:
      existing?.title ||
      params.get("topic") ||
      (integrated ? context.topic : ""),
    count: existing?.questions.length || (integrated ? context.count : 5),
    difficulty: existing?.difficulty || (integrated ? context.level : "O‘rta"),
    language: existing?.language || (integrated ? context.language : "O‘zbek"),
    time: existing?.time || (integrated ? context.duration : 45),
    variants: existing?.variants?.length || (integrated ? context.variants : 1),
    answerFormat:
      existing?.answerFormat ||
      (integrated ? context.answerFormat : ("steps" as const)),
  });
  const [types, setTypes] = useState<string[]>(
    existing
      ? [...new Set(existing.questions.map((q) => q.type))]
      : [assessment ? "Qisqa javob" : "Variantli"],
  );
  const [test, setTest] = useState<Quiz | null>(
    existing ? structuredClone(existing) : null,
  );
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [keys, setKeys] = useState(false);
  useEffect(() => {
    if (existing)
      usePreparation.getState().update({
        subject: existing.subject,
        grade: existing.grade,
        classId: existing.classId,
        topic: existing.title,
        language: existing.language || "O‘zbek",
      });
    setTest(existing ? structuredClone(existing) : null);
    setActive(0);
    setPreview(false);
    if (existing) setTypes([...new Set(existing.questions.map((q) => q.type))]);
    if (existing)
      setForm((f) => ({
        ...f,
        subject: existing.subject,
        grade: existing.grade,
        classId: existing.classId,
        topic: existing.title,
        time: existing.time,
        count: existing.questions.length,
        variants: existing.variants?.length || 1,
        difficulty: existing.difficulty || "O‘rta",
        language: existing.language || "O‘zbek",
        answerFormat: existing.answerFormat || "steps",
      }));
  }, [id]);
  const variants = test?.variants?.length
    ? test.variants
    : test
      ? [{ label: "A", questions: test.questions }]
      : [];
  const questions = variants[active]?.questions || [];
  const input = (typeList = types): AIInput => ({
    subject: form.subject,
    topic: form.topic,
    grade: form.grade,
    duration: form.time,
    count: form.count,
    level: form.difficulty,
    language: form.language,
    questionTypes: typeList,
    answerFormat: form.answerFormat,
    instructions: integrated ? context.instructions : "",
  });
  const update = (next: Question[]) =>
    setTest((prev) => {
      if (!prev) return prev;
      const vs = prev.variants?.length
        ? prev.variants
        : [{ label: "A", questions: prev.questions }];
      const changed = vs.map((v, i) =>
        i === active ? { ...v, questions: next } : v,
      );
      return { ...prev, variants: changed, questions: changed[0].questions };
    });
  const change = (q: Question) =>
    update(questions.map((x) => (x.id === q.id ? q : x)));
  async function generate() {
    if (form.topic.trim().length < 3 || !types.length) {
      toast.error("Mavzu va kamida bitta savol turini tanlang.");
      return;
    }
    if (
      !Number.isInteger(form.count) ||
      form.count < 1 ||
      form.count > 30 ||
      form.variants < 1 ||
      form.variants > 4
    ) {
      toast.error("1–30 savol, 1–4 variant tanlang.");
      return;
    }
    setBusy(true);
    try {
      const vs = [];
      for (let v = 0; v < form.variants; v++)
        vs.push({
          label: String.fromCharCode(65 + v),
          questions: await aiService.generateQuiz({ ...input(), variant: v }),
        });
      setTest({
        id: id || uid(),
        kind: existing?.kind || (assessment ? "assessment" : "test"),
        answerFormat: form.answerFormat,
        title: form.topic.trim(),
        subject: form.subject,
        grade: form.grade,
        classId: form.classId,
        status: "Tayyor",
        questions: vs[0].questions,
        variants: vs,
        time: form.time,
        date: today(),
        difficulty: form.difficulty,
        language: form.language,
      });
      setActive(0);
      setPreview(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Test yaratilmadi.");
    } finally {
      setBusy(false);
    }
  }
  function save() {
    if (!test) return;
    if (!test.title.trim()) {
      toast.error("Test nomini kiriting.");
      return;
    }
    for (const v of variants) {
      if (!v.questions.length) {
        toast.error("Har bir variantga savol qo‘shing.");
        return;
      }
      for (const q of v.questions) {
        if (
          !q.text.trim() ||
          q.points < 1 ||
          q.points > 100 ||
          !Number.isFinite(q.points)
        ) {
          toast.error("Savol matni va ballni tekshiring.");
          return;
        }
        if (
          ["Variantli", "Bir nechta javob", "To‘g‘ri / noto‘g‘ri"].includes(
            q.type,
          ) &&
          (!q.options.length ||
            q.options.some((o) => !o.trim()) ||
            (q.type === "Bir nechta javob"
              ? !q.correctAnswers?.length
              : q.correct < 0 || q.correct >= q.options.length))
        ) {
          toast.error(
            "Barcha variantlarni to‘ldirib, to‘g‘ri javobni belgilang.",
          );
          return;
        }
        if (
          q.type === "Moslashtirish" &&
          (!q.pairs?.length ||
            q.pairs.some((p) => !p.left.trim() || !p.right.trim()))
        ) {
          toast.error("Moslashtirish juftliklarini to‘ldiring.");
          return;
        }
      }
    }
    mutate((d) => {
      const i = d.quizzes.findIndex((x) => x.id === test.id);
      if (i < 0) d.quizzes.unshift(test);
      else d.quizzes[i] = test;
    });
    toast.success("Test va barcha variantlar saqlandi");
    navigate("/teacher/quizzes/" + test.id);
  }
  if (id && !existing && !test) return <Empty title="Test topilmadi" />;
  return (
    <>
      <PageHead
        title={
          assessment || existing?.kind === "assessment"
            ? "Nazorat ishi"
            : "Test generatori"
        }
        description="Matematika uchun savollar, variantlar va tekshiriladigan yechimlar."
        action={
          <Button asChild variant="outline">
            <Link to="/teacher/quizzes">Saqlangan testlar</Link>
          </Button>
        }
      />
      <DemoNote>
        Mock AI: shablon asosidagi namuna savollar. Eksportdan oldin mazmun va
        javoblarni tekshiring. Tanlangan til hujjat metama’lumotida; namuna
        matnlari hozir o‘zbekcha.
      </DemoNote>
      <div className="teacher-generator">
        <Card className="tool-config">
          <h2>Test parametrlari</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void generate();
            }}
          >
            <Field label="Fan" hidden={integrated}>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              >
                {subjects.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Sinf" hidden={integrated}>
              <select
                value={form.classId || form.grade}
                onChange={(e) => {
                  const c = classes.find((c) => c.id === e.target.value);
                  setForm({
                    ...form,
                    classId: c?.id || "",
                    grade: String(c?.grade || e.target.value),
                  });
                }}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                {Array.from({ length: 11 }, (_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}-sinf
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Mavzu" hidden={integrated}>
              <input
                required
                minLength={3}
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
              />
            </Field>
            <MathTopicSuggestions
              hidden={integrated}
              grade={form.grade}
              subject={form.subject}
              value={form.topic}
              onSelect={(topic) => setForm({ ...form, topic })}
            />
            <div className="form-grid">
              <Field label="Savollar soni" hidden={integrated}>
                <input
                  type="number"
                  required
                  min={1}
                  max={30}
                  value={form.count}
                  onChange={(e) =>
                    setForm({ ...form, count: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Variantlar soni" hidden={integrated}>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={form.variants}
                  onChange={(e) =>
                    setForm({ ...form, variants: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
            <Field label="Qiyinlik" hidden={integrated}>
              <select
                value={form.difficulty}
                onChange={(e) =>
                  setForm({ ...form, difficulty: e.target.value })
                }
              >
                {["Oson", "O‘rta", "Murakkab", "Aralash"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Til" hidden={integrated}>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
              >
                {["O‘zbek", "Rus", "Ingliz"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Davomiylik (daqiqa)" hidden={integrated}>
              <input
                type="number"
                min={5}
                max={180}
                value={form.time}
                onChange={(e) =>
                  setForm({ ...form, time: Number(e.target.value) })
                }
              />
            </Field>
            {!integrated && (
              <Field label="Ustoz javoblari">
                <select
                  value={form.answerFormat}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      answerFormat: e.target.value as "answer" | "steps",
                    })
                  }
                >
                  <option value="answer">Faqat javob</option>
                  <option value="steps">Bosqichma-bosqich yechim</option>
                </select>
              </Field>
            )}
            <fieldset>
              <legend>Savol turlari</legend>
              {questionTypes.map((t) => (
                <label className="check-label" key={t}>
                  <input
                    type="checkbox"
                    checked={types.includes(t)}
                    onChange={(e) =>
                      setTypes(
                        e.target.checked
                          ? [...types, t]
                          : types.filter((x) => x !== t),
                      )
                    }
                  />
                  {t}
                </label>
              ))}
            </fieldset>
            <Button className="full" disabled={busy}>
              <Sparkles size={16} />
              {busy
                ? "Tayyorlanmoqda…"
                : assessment
                  ? "Nazorat ishi yaratish"
                  : "Namuna test yaratish"}
            </Button>
          </form>
        </Card>
        <div className="tool-result">
          {test ? (
            <>
              <Card>
                <div className="button-row">
                  <Button onClick={save}>
                    <Save size={16} />
                    Saqlash
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPreview(!preview)}
                  >
                    <Eye size={16} />
                    {preview ? "Tahrirlash" : "Oldindan ko‘rish"}
                  </Button>
                </div>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={keys}
                    onChange={(e) => setKeys(e.target.checked)}
                  />
                  Javoblarni oldindan ko‘rishda ko‘rsatish
                </label>
                <SeparateExports
                  title={test.title}
                  content={quizText(test, false)}
                  answerKey={quizKeys(test)}
                />
                <MaterialActions
                  topic={test.title}
                  subject={test.subject}
                  grade={test.grade}
                  onApply={(r) =>
                    update([
                      ...questions,
                      {
                        id: uid(),
                        text: r.content,
                        type: "Qisqa javob",
                        options: [],
                        correct: 0,
                        answer:
                          r.answerKey.split("Javob: ").pop() || r.answerKey,
                        solution: r.answerKey,
                        points: 2,
                      },
                    ])
                  }
                />
                <div className="tabs">
                  {variants.map((v, i) => (
                    <button
                      key={v.label}
                      className={i === active ? "active" : ""}
                      onClick={() => setActive(i)}
                    >
                      {v.label} variant · {v.questions.length} savol
                    </button>
                  ))}
                </div>
                <Field label="Test nomi">
                  <input
                    value={test.title}
                    onChange={(e) =>
                      setTest({ ...test, title: e.target.value })
                    }
                  />
                </Field>
              </Card>
              {preview ? (
                <Card className="document-card">
                  <h2>
                    {test.title} — {variants[active]?.label} variant
                  </h2>
                  {questions.map((q, i) => (
                    <section className="test-question" key={q.id}>
                      <h3>
                        {i + 1}. {q.text} <small>({q.points} ball)</small>
                      </h3>
                      {q.type === "Moslashtirish" ? (
                        <div className="form-grid">
                          <div>
                            {q.pairs?.map((p, n) => (
                              <p key={n}>
                                {n + 1}. {p.left}
                              </p>
                            ))}
                          </div>
                          <div>
                            {q.pairs?.map((_, n) => (
                              <p key={n}>
                                {String.fromCharCode(65 + n)}.{" "}
                                {q.pairs?.[(n + 1) % q.pairs.length].right}
                              </p>
                            ))}
                          </div>
                        </div>
                      ) : (
                        q.options.map((o, n) => (
                          <p key={n}>
                            □ {String.fromCharCode(65 + n)}. {o}
                          </p>
                        ))
                      )}
                      {!q.options.length && q.type !== "Moslashtirish" && (
                        <p>Javob: ___________________________</p>
                      )}
                      {keys && (
                        <div className="answer-key">
                          Javob: {answerText(q)}
                          {test.answerFormat !== "answer" && q.solution && (
                            <pre>{q.solution}</pre>
                          )}
                        </div>
                      )}
                    </section>
                  ))}
                </Card>
              ) : (
                <>
                  {questions.map((q, i) => (
                    <Card key={q.id} className="question-editor">
                      <div className="resource-top">
                        <Badge>
                          {i + 1}-savol · {q.type}
                        </Badge>
                        <div className="button-row">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`${i + 1}-savolni yuqoriga`}
                            disabled={i === 0}
                            onClick={() => {
                              const list = [...questions];
                              [list[i - 1], list[i]] = [list[i], list[i - 1]];
                              update(list);
                            }}
                          >
                            <ArrowUp size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`${i + 1}-savolni pastga`}
                            disabled={i === questions.length - 1}
                            onClick={() => {
                              const list = [...questions];
                              [list[i], list[i + 1]] = [list[i + 1], list[i]];
                              update(list);
                            }}
                          >
                            <ArrowDown size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`${i + 1}-savolni qayta yaratish`}
                            disabled={!!regenerating}
                            onClick={async () => {
                              setRegenerating(q.id);
                              try {
                                const generated = await aiService.generateQuiz({
                                  ...input([q.type]),
                                  topic: test.title,
                                  subject: test.subject,
                                  grade: test.grade,
                                  count: 1,
                                  variant: i + active + 1,
                                });
                                setTest((prev) => {
                                  if (!prev) return prev;
                                  const vs = prev.variants?.length
                                    ? prev.variants
                                    : [
                                        {
                                          label: "A",
                                          questions: prev.questions,
                                        },
                                      ];
                                  const next = vs.map((v) => ({
                                    ...v,
                                    questions: v.questions.map((item) =>
                                      item.id === q.id
                                        ? { ...generated[0], id: q.id }
                                        : item,
                                    ),
                                  }));
                                  return {
                                    ...prev,
                                    variants: next,
                                    questions: next[0].questions,
                                  };
                                });
                              } catch {
                                toast.error("Savol yangilanmadi.");
                              } finally {
                                setRegenerating(null);
                              }
                            }}
                          >
                            <RefreshCw
                              size={16}
                              className={regenerating === q.id ? "spin" : ""}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`${i + 1}-savolni o‘chirish`}
                            onClick={() =>
                              update(questions.filter((x) => x.id !== q.id))
                            }
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                      <Field label={`${i + 1}-savol matni`}>
                        <textarea
                          value={q.text}
                          onChange={(e) =>
                            change({ ...q, text: e.target.value })
                          }
                        />
                      </Field>
                      <Field label="Ustoz uchun yechim">
                        <textarea
                          value={q.solution || ""}
                          onChange={(e) =>
                            change({ ...q, solution: e.target.value })
                          }
                        />
                      </Field>
                      <div className="form-grid">
                        <Field label="Savol turi">
                          <select
                            value={q.type}
                            onChange={(e) => {
                              const type = e.target.value;
                              change({
                                ...blank(type),
                                id: q.id,
                                text: q.text,
                                options:
                                  type === "To‘g‘ri / noto‘g‘ri"
                                    ? ["To‘g‘ri", "Noto‘g‘ri"]
                                    : [
                                          "Variantli",
                                          "Bir nechta javob",
                                        ].includes(type)
                                      ? ["", "", "", ""]
                                      : [],
                              });
                            }}
                          >
                            {questionTypes.map((t) => (
                              <option key={t}>{t}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Ball">
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={q.points}
                            onChange={(e) =>
                              change({ ...q, points: Number(e.target.value) })
                            }
                          />
                        </Field>
                      </div>
                      {q.options.map((o, n) => (
                        <div className="option-edit" key={n}>
                          <input
                            aria-label={`${i + 1}-savol ${String.fromCharCode(65 + n)} to‘g‘ri javob`}
                            type={
                              q.type === "Bir nechta javob"
                                ? "checkbox"
                                : "radio"
                            }
                            name={q.id}
                            checked={
                              q.type === "Bir nechta javob"
                                ? (q.correctAnswers || []).includes(n)
                                : q.correct === n
                            }
                            onChange={(e) =>
                              change(
                                q.type === "Bir nechta javob"
                                  ? {
                                      ...q,
                                      correctAnswers: e.target.checked
                                        ? [...(q.correctAnswers || []), n]
                                        : (q.correctAnswers || []).filter(
                                            (a) => a !== n,
                                          ),
                                    }
                                  : { ...q, correct: n },
                              )
                            }
                          />
                          <input
                            aria-label={`${i + 1}-savol ${String.fromCharCode(65 + n)} variant`}
                            value={o}
                            onChange={(e) =>
                              change({
                                ...q,
                                options: q.options.map((a, j) =>
                                  j === n ? e.target.value : a,
                                ),
                              })
                            }
                          />
                          {q.type !== "To‘g‘ri / noto‘g‘ri" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Javob variantini o‘chirish"
                              disabled={q.options.length <= 2}
                              onClick={() =>
                                change({
                                  ...q,
                                  options: q.options.filter((_, j) => j !== n),
                                  correct:
                                    q.correct === n
                                      ? 0
                                      : q.correct > n
                                        ? q.correct - 1
                                        : q.correct,
                                  correctAnswers: (q.correctAnswers || [])
                                    .filter((a) => a !== n)
                                    .map((a) => (a > n ? a - 1 : a)),
                                })
                              }
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      ))}
                      {["Variantli", "Bir nechta javob"].includes(q.type) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={q.options.length >= 8}
                          onClick={() =>
                            change({ ...q, options: [...q.options, ""] })
                          }
                        >
                          Javob varianti qo‘shish
                        </Button>
                      )}
                      {q.type === "Moslashtirish" && (
                        <>
                          {q.pairs?.map((p, n) => (
                            <div className="option-edit" key={n}>
                              <input
                                aria-label={`${n + 1}-chap tushuncha`}
                                value={p.left}
                                onChange={(e) =>
                                  change({
                                    ...q,
                                    pairs: q.pairs?.map((a, j) =>
                                      j === n
                                        ? { ...a, left: e.target.value }
                                        : a,
                                    ),
                                  })
                                }
                              />
                              <span>→</span>
                              <input
                                aria-label={`${n + 1}-mos javob`}
                                value={p.right}
                                onChange={(e) =>
                                  change({
                                    ...q,
                                    pairs: q.pairs?.map((a, j) =>
                                      j === n
                                        ? { ...a, right: e.target.value }
                                        : a,
                                    ),
                                  })
                                }
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Juftlikni o‘chirish"
                                disabled={(q.pairs?.length || 0) <= 2}
                                onClick={() =>
                                  change({
                                    ...q,
                                    pairs: q.pairs?.filter((_, j) => j !== n),
                                  })
                                }
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="ghost"
                            onClick={() =>
                              change({
                                ...q,
                                pairs: [
                                  ...(q.pairs || []),
                                  { left: "", right: "" },
                                ],
                              })
                            }
                          >
                            Juftlik qo‘shish
                          </Button>
                        </>
                      )}
                      {!q.options.length && q.type !== "Moslashtirish" && (
                        <Field
                          label={
                            q.type === "Ochiq savol"
                              ? "Baholash mezoni"
                              : "Namunaviy javob"
                          }
                        >
                          <textarea
                            value={q.answer}
                            onChange={(e) =>
                              change({ ...q, answer: e.target.value })
                            }
                          />
                        </Field>
                      )}
                    </Card>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => update([...questions, blank()])}
                  >
                    <Plus size={16} />
                    Savol qo‘shish
                  </Button>
                </>
              )}
            </>
          ) : (
            <Card>
              <Empty
                title="Test yaratishga tayyormisiz?"
                description="Parametrlarni tanlang. Savollarni tahrirlang, variantlarni tekshiring va hujjat sifatida saqlang."
              />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
