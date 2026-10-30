import GenerationSummary from "@/features/mathematics/GenerationSummary";
import TaskEditor from "@/features/mathematics/TaskEditor";
import { useLocalDraft } from "@/stores/useLocalDraft";
import MaterialActions from "@/features/mathematics/MaterialActions";
import SeparateExports from "@/features/mathematics/SeparateExports";
import { usePreparation, usePreparationContext } from "@/stores/usePreparation";
import { documentPath } from "@/features/workspace/subjects";
import MathTopicSuggestions from "@/features/mathematics/MathTopicSuggestions";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Save,
  BookOpen,
  NotebookPen,
  FileText,
  ArrowUpRight,
  Check,
  Eye,
  Pencil,
  LoaderCircle,
  FolderOpen,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/stores/useStore";
import { aiService } from "@/services/ai/service";
import { teacherClasses } from "@/services/api/onboardingRepository";
import { subjects } from "@/data/seed";
import { uid, today, dateLabel } from "@/utils/cn";
import type { TeachingDocument } from "@/types";
import { PageHead, Card, Button, Field, Empty } from "@/components/common";
import "./documents.css";

export default function Documents({
  kind,
  integrated = false,
}: {
  kind: "conspect" | "homework" | "exercise";
  integrated?: boolean;
}) {
  const context = usePreparationContext();
  const { id } = useParams();
  const { db, mutate } = useStore();
  const existing = db.documents.find((d) => d.id === id && d.kind === kind);
  const [document, setDocument, draftError] =
    useLocalDraft<TeachingDocument | null>(
      kind + ":" + (id || "new"),
      existing ? structuredClone(existing) : null,
    );
  const [form, setForm] = useState({
    topic: existing?.title || (integrated ? context.topic : ""),
    subject:
      existing?.subject || (integrated ? context.subject : db.teacher.subject),
    grade:
      existing?.grade ||
      (integrated ? context.grade : String(teacherClasses(db)[0]?.grade || 8)),
    level: existing?.level || (integrated ? context.level : "O‘rta"),
    count: existing?.count || (integrated ? context.count : 5),
    language: existing?.language || (integrated ? context.language : "O‘zbek"),
    variants: existing?.variants || (integrated ? context.variants : 1),
    answerFormat:
      existing?.answerFormat ||
      (integrated ? context.answerFormat : ("steps" as const)),
  });
  const [busy, setBusy] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (existing)
      usePreparation.getState().update({
        subject: existing.subject,
        grade: existing.grade,
        topic: existing.title,
      });

    setForm((f) => ({
      ...f,
      topic: existing?.title || (integrated ? context.topic : ""),
      subject:
        existing?.subject ||
        (integrated ? context.subject : db.teacher.subject),
      grade:
        existing?.grade ||
        (integrated
          ? context.grade
          : String(teacherClasses(db)[0]?.grade || 8)),
      level: existing?.level || (integrated ? context.level : "O‘rta"),
      count: existing?.count || (integrated ? context.count : 5),
      variants: existing?.variants || (integrated ? context.variants : 1),
      answerFormat:
        existing?.answerFormat || (integrated ? context.answerFormat : "steps"),
      language:
        existing?.language || (integrated ? context.language : "O‘zbek"),
    }));
    setShowKey(false);
    setEditing(false);
  }, [id, kind]);
  useEffect(() => {
    if (integrated) setForm((f) => ({ ...f, ...context }));
  }, [context, integrated]);
  const isConspect = kind === "conspect";
  const name = isConspect
    ? "Konspekt"
    : kind === "exercise"
      ? "Mashq"
      : "Uy vazifasi";
  const path = documentPath(kind);
  const Icon = isConspect ? BookOpen : NotebookPen;
  const saved = db.documents.filter((d) => d.kind === kind);
  const stored = db.documents.find((d) => d.id === document?.id);
  const isSaved =
    !!document && JSON.stringify(stored) === JSON.stringify(document);
  function save() {
    if (!document?.title.trim() || !document.content.trim()) {
      toast.error("Nom va matnni kiriting.");
      return;
    }
    try {
      mutate((d) => {
        const i = d.documents.findIndex((x) => x.id === document.id);
        if (i < 0) d.documents.unshift(document);
        else d.documents[i] = document;
      });
    } catch {
      toast.error(
        "Saqlanmadi. Qoralama oynada saqlanib turibdi; qurilma xotirasini tekshirib qayta urinib ko‘ring.",
      );
      return;
    }
    toast.success("Hujjat saqlandi");
    navigate("/teacher/" + path + "/" + document.id);
  }
  if (id && !existing) return <Empty title="Hujjat topilmadi" />;
  return (
    <div className="document-studio">
      <PageHead
        eyebrow="AI VOSITALAR"
        title={name + " yaratish"}
        description={
          isConspect
            ? "Mavzu tushuntirishi, misollar va asosiy qoidalar."
            : "Mashqlar, izohlar va javob kaliti."
        }
        action={
          <span className="studio-feature-label">
            <Icon size={16} /> O‘qituvchi ish maydoni
          </span>
        }
      />
      <div className="studio-demo-note">
        <Sparkles size={16} />
        <p>
          <b>Demo AI</b> · Fan bo‘yicha shablon asosida namuna yaratiladi.
          Natijani darsingizga moslab tahrirlang.
        </p>
      </div>
      {draftError && (
        <p role="alert" className="error-text">
          {draftError}
        </p>
      )}
      {generationError && (
        <p role="alert" className="error-text">
          {generationError} Sozlamalar saqlangan. Yaratish tugmasi orqali qayta
          urinib ko‘ring.
        </p>
      )}
      <div className="studio-grid">
        <aside className="studio-sidebar">
          <Card className="studio-config">
            <div className="studio-card-heading">
              <span className="studio-icon">
                <Icon size={21} />
              </span>
              <div>
                <h2>Hujjat parametrlari</h2>
                <p>Yaxshi natija tafsilotlardan boshlanadi.</p>
              </div>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  const parameters = {
                    ...form,
                    duration: 45,
                    ...(integrated ? context : {}),
                  };
                  const result = await aiService.generateDocument(
                    parameters,
                    kind === "conspect" ? "conspect" : "homework",
                  );
                  setDocument({
                    id: document?.id || uid(),
                    generation: parameters,
                    title: parameters.topic,
                    kind,
                    subject: parameters.subject,
                    grade: parameters.grade,
                    date: today(),
                    level: parameters.level,
                    count: parameters.count,
                    language: parameters.language,
                    variants: parameters.variants,
                    answerFormat: parameters.answerFormat,
                    ...result,
                  });
                  setEditing(false);
                  setGenerationError("");
                } catch (error) {
                  const message =
                    error instanceof Error
                      ? error.message
                      : "Hujjat yaratilmadi.";
                  setGenerationError(message);
                  toast.error(message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <fieldset disabled={busy}>
                <div className="studio-form-section">
                  <span>01</span>Mavzu va auditoriya
                </div>
                <Field label="Mavzu" hidden={integrated}>
                  <input
                    required
                    minLength={3}
                    placeholder={
                      isConspect
                        ? "Masalan, oddiy kasrlar"
                        : "Masalan, ko‘paytirish amallari"
                    }
                    value={form.topic}
                    onChange={(e) =>
                      setForm({ ...form, topic: e.target.value })
                    }
                  />
                </Field>
                <div className="studio-field-pair">
                  <Field label="Fan" hidden={integrated}>
                    <select
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                    >
                      {subjects.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Sinf" hidden={integrated}>
                    <select
                      value={form.grade}
                      onChange={(e) =>
                        setForm({ ...form, grade: e.target.value })
                      }
                    >
                      {Array.from({ length: 11 }, (_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1}-sinf
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <MathTopicSuggestions
                  hidden={integrated}
                  grade={form.grade}
                  subject={form.subject}
                  value={form.topic}
                  onSelect={(topic) => setForm({ ...form, topic })}
                />
                <div className="studio-form-section">
                  <span>02</span>Natijani moslashtiring
                </div>
                <Field label="Qiyinlik" hidden={integrated}>
                  <div className="studio-choices">
                    {["Oson", "O‘rta", "Murakkab", "Aralash"].map((level) => (
                      <button
                        type="button"
                        key={level}
                        aria-pressed={form.level === level}
                        onClick={() => setForm({ ...form, level })}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </Field>
                <div className={isConspect ? "" : "studio-field-pair"}>
                  {!isConspect && (
                    <Field label="Mashqlar soni" hidden={integrated}>
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
                  )}
                  <Field label="Til" hidden={integrated}>
                    <select
                      value={form.language}
                      onChange={(e) =>
                        setForm({ ...form, language: e.target.value })
                      }
                    >
                      {["O‘zbek", "Rus", "Ingliz"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                {!integrated && (
                  <>
                    <Field label="Variantlar soni">
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
                  </>
                )}
                <Button disabled={busy} className="studio-generate">
                  <Sparkles size={17} className={busy ? "spin" : ""} />
                  {busy
                    ? "Tayyorlanmoqda…"
                    : generationError
                      ? "Qayta urinish"
                      : "Namuna yaratish"}
                  <ArrowUpRight size={16} />
                </Button>
              </fieldset>
              <p className="studio-form-footnote">
                {isConspect
                  ? "Tushuntirish, misollar va takrorlash savollari."
                  : "Mashqlar va alohida tahrirlanadigan javob kaliti."}
              </p>
            </form>
          </Card>
          <Card className="studio-history">
            <div className="studio-history-heading">
              <h2>
                <FolderOpen size={17} />
                Saqlangan hujjatlar
              </h2>
              <span>{saved.length}</span>
            </div>
            {saved.length ? (
              <div className="studio-saved-list">
                {saved.map((d) => (
                  <Link
                    className={
                      "studio-saved-item " + (d.id === id ? "active" : "")
                    }
                    key={d.id}
                    to={"/teacher/" + path + "/" + d.id}
                  >
                    <span className="studio-file-icon">
                      <FileText size={16} />
                    </span>
                    <div>
                      <b>{d.title}</b>
                      <small>
                        {d.subject} · {dateLabel(d.date)}
                      </small>
                    </div>
                    <ChevronRight size={15} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="studio-history-empty">
                <FileText size={22} />
                <p>
                  Saqlagan{" "}
                  {isConspect ? "konspektlaringiz" : "uy vazifalaringiz"}
                  <br />
                  shu yerda tartibli turadi.
                </p>
              </div>
            )}
          </Card>
        </aside>
        <section
          className="studio-workspace"
          aria-label={name + " ish maydoni"}
          aria-busy={busy}
        >
          <div className="studio-workspace-top">
            <div className="studio-workspace-title">
              <FileText size={17} />
              <h2>{document ? "Hujjatingiz" : "Natija oynasi"}</h2>
            </div>
            {document && (
              <span className={"studio-status " + (isSaved ? "saved" : "")}>
                {isSaved ? <Check size={12} /> : <span />}
                {isSaved ? "Saqlangan" : "Qoralama"}
              </span>
            )}
          </div>
          {document && !busy && (
            <div className="studio-toolbar">
              <div
                className="studio-view-tabs"
                role="group"
                aria-label="Hujjat ko‘rinishi"
              >
                <button
                  aria-pressed={!editing}
                  onClick={() => setEditing(false)}
                >
                  <Eye size={15} />
                  Ko‘rib chiqish
                </button>
                <button aria-pressed={editing} onClick={() => setEditing(true)}>
                  <Pencil size={15} />
                  Tahrirlash
                </button>
              </div>
            </div>
          )}
          {document && !busy && (
            <GenerationSummary value={document.generation} />
          )}
          {document && !busy && (
            <SeparateExports
              title={document.title}
              content={document.content}
              answerKey={document.answerKey}
            />
          )}
          <div className={"studio-canvas " + (!document ? "is-empty" : "")}>
            {busy ? (
              <div className="studio-loading" role="status">
                <span className="studio-loading-icon">
                  <LoaderCircle className="spin" size={29} />
                </span>
                <h3>{name} tayyorlanmoqda</h3>
                <p>Mavzuingiz uchun tuzilgan namuna yaratyapmiz…</p>
                <div className="studio-loading-lines">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            ) : document ? (
              <>
                <article className="studio-paper">
                  <div className="studio-paper-kicker">
                    <span>
                      {isConspect
                        ? "DARS KONSPEKTI"
                        : kind === "exercise"
                          ? "MASHQLAR"
                          : "UY VAZIFASI"}
                    </span>
                    <span>
                      {document.grade}-sinf · {document.subject}
                    </span>
                  </div>
                  {editing ? (
                    <>
                      <Field label="Hujjat nomi">
                        <input
                          className="studio-title-input"
                          value={document.title}
                          onChange={(e) =>
                            setDocument({ ...document, title: e.target.value })
                          }
                        />
                      </Field>
                      {document.tasks?.length && document.generation ? (
                        <TaskEditor
                          document={document}
                          onChange={setDocument}
                        />
                      ) : (
                        <>
                          <Field label="Hujjat matni">
                            <textarea
                              className="studio-editor"
                              value={document.content}
                              onChange={(e) =>
                                setDocument({
                                  ...document,
                                  content: e.target.value,
                                })
                              }
                            />
                          </Field>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <h2 className="studio-paper-title">{document.title}</h2>
                      <div className="studio-paper-rule" />
                      <div className="studio-paper-content">
                        {document.content.split(/\n\s*\n/).map((block, i) => {
                          const lines = block.split("\n");
                          return (
                            <section key={i}>
                              {i > 0 && lines.length > 1 ? (
                                <>
                                  <h3>{lines[0]}</h3>
                                  <p>{lines.slice(1).join("\n")}</p>
                                </>
                              ) : (
                                <p>{block}</p>
                              )}
                            </section>
                          );
                        })}
                      </div>
                    </>
                  )}
                  <footer className="studio-paper-footer">
                    <span>TeacherCopilot AI · Namuna hujjat</span>
                    <span>{dateLabel(document.date)}</span>
                  </footer>
                </article>
                {!!document.answerKey && (
                  <div className="studio-answer-panel">
                    <label>
                      <span className="studio-answer-icon">
                        <Check size={17} />
                      </span>
                      <span>
                        <b>Javob kaliti</b>
                        <small>Faqat ustozga ko‘rinadi</small>
                      </span>
                      <input
                        type="checkbox"
                        checked={showKey}
                        onChange={(e) => setShowKey(e.target.checked)}
                        aria-label="Javob kalitini ko‘rsatish"
                      />
                    </label>
                    {showKey && (
                      <Field label="Javob kaliti">
                        <textarea
                          rows={6}
                          value={document.answerKey}
                          onChange={(e) =>
                            setDocument({
                              ...document,
                              answerKey: e.target.value,
                            })
                          }
                        />
                      </Field>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="studio-empty-content">
                <div className="studio-empty-art" aria-hidden="true">
                  <div className="studio-mini-sheet behind" />
                  <div className="studio-mini-sheet">
                    <span className="studio-mini-icon">
                      <Icon size={24} />
                    </span>
                    <b>
                      {isConspect ? "Asosiy tushunchalar" : "Mashqlar to‘plami"}
                    </b>
                    <i />
                    <i />
                    <i />
                    <div className="studio-mini-line">
                      <span />
                      <i />
                    </div>
                    <div className="studio-mini-line">
                      <span />
                      <i />
                    </div>
                  </div>
                  <span className="studio-art-spark">
                    <Sparkles size={21} />
                  </span>
                </div>
                <span className="studio-empty-label">
                  KEYINGI YAXSHI DARSINGIZ UCHUN
                </span>
                <h2>
                  {isConspect
                    ? "Tartibli fikrlar. Tayyor konspekt."
                    : "Yangi bilimni mustahkamlang."}
                </h2>
                <p>
                  {isConspect
                    ? "Mavzuni belgilang — tushuntirishlar, misollar va savollardan iborat konspekt shu yerda paydo bo‘ladi."
                    : "Mavzu va qiyinlikni tanlang — mashqlar, ko‘rsatmalar va javoblar bir joyda tayyor bo‘ladi."}
                </p>
                <div className="studio-empty-steps">
                  {[
                    "Parametrlarni tanlang",
                    "Namuna yarating",
                    "Tahrirlang va saqlang",
                  ].map((s, i) => (
                    <span key={s}>
                      <b>{i + 1}</b>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {document && !busy && (
            <MaterialActions
              topic={document.title}
              subject={document.subject}
              grade={document.grade}
              onApply={(r) =>
                setDocument({
                  ...document,
                  content:
                    document.content + "\n\nQo‘shimcha mashq\n" + r.content,
                  tasks: undefined,
                  answerKey:
                    document.answerKey + "\n\nQo‘shimcha mashq\n" + r.answerKey,
                })
              }
            />
          )}
          {document && !busy && (
            <div className="studio-bottom-bar">
              <span>
                <span className="studio-bottom-dot" />{" "}
                {isSaved
                  ? "Hujjat kutubxonangizda saqlangan"
                  : "O‘zgarishlarni saqlashni unutmang"}
              </span>
              <Button onClick={save}>
                <Save size={16} />
                Saqlash
              </Button>
            </div>
          )}
          {!document && !busy && (
            <div className="studio-tip">
              <Lightbulb size={17} />
              <p>
                <b>Kichik tavsiya</b> · Aniq mavzu nomi natijani darsingizga
                moslashtirishni osonlashtiradi.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
