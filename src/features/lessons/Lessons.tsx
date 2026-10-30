import MaterialActions from "@/features/mathematics/MaterialActions";
import { usePreparation, usePreparationContext } from "@/stores/usePreparation";
import MathTopicSuggestions from "@/features/mathematics/MathTopicSuggestions";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Clock,
  Grid2X2,
  List,
  Copy,
  Archive,
  Trash2,
  ArrowLeft,
  Sparkles,
  Save,
  Printer,
  FileDown,
  Pencil,
  RefreshCw,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/stores/useStore";
import { mockRepository } from "@/services/api/repository";
import { aiService } from "@/services/ai/service";
import { subjects } from "@/data/seed";
import { printDocument, exportWord } from "@/utils/export";
import { uid, today, dateLabel, downloadText } from "@/utils/cn";
import type { Lesson, LessonSection } from "@/types";
import {
  PageHead,
  Card,
  Button,
  Badge,
  SearchInput,
  NewLink,
  Confirm,
  Field,
  Empty,
  Loading,
  ErrorState,
  DemoNote,
  copy,
} from "@/components/common";
export function Lessons() {
  const { db, mutate } = useStore();
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [status, setStatus] = useState("");
  const [grid, setGrid] = useState(true);
  const { isPending, isError, refetch } = useQuery({
    queryKey: ["lessons"],
    queryFn: mockRepository.getLessons,
  });
  const filtered = db.lessons.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) &&
      (!subject || l.subject === subject) &&
      (!grade || l.grade === grade) &&
      (!status || l.status === status),
  );
  return (
    <>
      <PageHead
        title="Darslarim"
        description="Har bir yaxshi dars puxta rejadan boshlanadi."
        action={
          <NewLink to="/teacher/lessons/create">Yangi dars yaratish</NewLink>
        }
      />
      <div className="toolbar">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Dars mavzusini qidirish…"
        />
        <select
          aria-label="Fan"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <option value="">Barcha fanlar</option>
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          aria-label="Sinf"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        >
          <option value="">Barcha sinflar</option>
          {Array.from({ length: 11 }, (_, i) => (
            <option value={i + 1} key={i}>
              {i + 1}-sinf
            </option>
          ))}
        </select>
        <select
          aria-label="Holat"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Barcha holatlar</option>
          {["Qoralama", "Tayyor", "Arxivlangan"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <div className="segmented">
          <button
            className={grid ? "selected" : ""}
            aria-label="Kartochkalar"
            onClick={() => setGrid(true)}
          >
            <Grid2X2 size={17} />
          </button>
          <button
            className={!grid ? "selected" : ""}
            aria-label="Ro‘yxat"
            onClick={() => setGrid(false)}
          >
            <List size={17} />
          </button>
        </div>
      </div>
      <div className="result-count">{filtered.length} ta dars</div>
      {isPending ? (
        <Loading />
      ) : isError ? (
        <ErrorState
          retry={() => {
            void refetch();
          }}
        />
      ) : !filtered.length ? (
        <Empty />
      ) : (
        <div className={grid ? "resource-grid" : "resource-list"}>
          {filtered.map((l) => (
            <Card key={l.id} className="lesson-card">
              <Link to={"/teacher/lessons/" + l.id}>
                <div className="resource-top">
                  <span className="icon-box blue">
                    <BookOpen size={23} />
                  </span>
                  <Badge>{l.status}</Badge>
                </div>
                <span className="overline">
                  {l.subject} · {l.grade}-sinf
                </span>
                <h3>{l.title}</h3>
                <p className="lesson-meta">
                  <Clock size={14} />
                  {l.duration} daqiqa <span>·</span>
                  {dateLabel(l.date)}
                </p>
              </Link>
              <div className="resource-actions">
                <Button variant="ghost" size="sm" asChild>
                  <Link to={"/teacher/lessons/" + l.id}>
                    <Pencil size={14} />
                    Ochish
                  </Link>
                </Button>
                <div>
                  <Button
                    title="Nusxa yaratish"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      mutate((d) => {
                        d.lessons.unshift({
                          ...structuredClone(l),
                          id: uid(),
                          title: l.title + " (nusxa)",
                          status: "Qoralama",
                          date: today(),
                        });
                      });
                      toast.success("Demo nusxa yaratildi");
                    }}
                  >
                    <Copy size={15} />
                  </Button>
                  <Button
                    title="Arxivlash"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      mutate((d) => {
                        const item = d.lessons.find((x) => x.id === l.id);
                        if (item)
                          item.status =
                            item.status === "Arxivlangan"
                              ? "Tayyor"
                              : "Arxivlangan";
                      })
                    }
                  >
                    <Archive size={15} />
                  </Button>
                  <Confirm
                    onConfirm={() => {
                      void mockRepository.deleteLesson(l.id);
                    }}
                  >
                    <Button title="O‘chirish" variant="ghost" size="icon">
                      <Trash2 size={15} />
                    </Button>
                  </Confirm>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
const schema = z.object({
  subject: z.string().min(1),
  grade: z.string().min(1),
  topic: z.string().min(3, "Mavzu kamida 3 ta belgidan iborat bo‘lsin."),
  duration: z.string(),
  level: z.string(),
  style: z.string(),
  language: z.string(),
  instructions: z.string(),
});
type Form = z.infer<typeof schema>;
export function LessonCreate({ integrated = false }: { integrated?: boolean }) {
  const context = usePreparationContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<LessonSection[] | null>(null);
  const [edit, setEdit] = useState(false);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      subject: integrated ? context.subject : "Matematika",
      grade: integrated ? context.grade : "8",
      topic: integrated ? context.topic : "",
      duration: integrated ? String(context.duration) : "45",
      level: integrated ? context.level : "O‘rta",
      style: "Interaktiv",
      language: integrated ? context.language : "O‘zbek",
      instructions: integrated ? context.instructions : "",
    },
  });
  const values = watch();
  const generate = async (data: Form) => {
    setLoading(true);
    setSaved(false);
    try {
      setSections(
        await aiService.generateLesson({
          ...data,
          duration: Number(data.duration),
          ...(integrated ? context : {}),
        }),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Dars yaratilmadi.");
    } finally {
      setLoading(false);
    }
  };
  const save = async () => {
    if (!sections) return;
    const lesson: Lesson = {
      id: uid(),
      title: values.topic,
      subject: values.subject,
      grade: values.grade,
      duration: Number(values.duration),
      date: today(),
      status: "Tayyor",
      sections,
    };
    await mockRepository.createLesson(lesson);
    setSaved(true);
    toast.success("Dars demo kutubxonaga saqlandi");
    navigate("/teacher/lessons/" + lesson.id);
  };
  return (
    <>
      <Link className="back-link" to="/teacher/lessons">
        <ArrowLeft size={16} />
        Darslarimga qaytish
      </Link>
      <PageHead
        eyebrow="AI VOSITALAR"
        title="Dars rejasini tayyorlang"
        description="Mavzuni kiriting, namuna rejasini yarating va o‘zingizga moslang."
      />
      <DemoNote>
        AI generator namoyishi: javoblar oldindan tayyorlangan shablonlardan
        olinadi.
      </DemoNote>
      <div className="generator-layout">
        <Card className="generator-form">
          <h2>Dars haqida</h2>
          <p>Rejani ehtiyojlaringizga moslashtiring.</p>
          <form onSubmit={handleSubmit(generate)}>
            <div className="form-grid">
              <Field label="Fan" hidden={integrated}>
                <select {...register("subject")}>
                  {subjects.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Sinf" hidden={integrated}>
                <select {...register("grade")}>
                  {Array.from({ length: 11 }, (_, i) => (
                    <option value={i + 1} key={i}>
                      {i + 1}-sinf
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field
              label="Dars mavzusi"
              hidden={integrated}
              error={errors.topic?.message}
            >
              <input
                placeholder="Masalan, chiziqli tenglamalar"
                {...register("topic")}
              />
            </Field>
            <MathTopicSuggestions
              hidden={integrated}
              grade={values.grade}
              subject={values.subject}
              value={values.topic}
              onSelect={(topic) => setValue("topic", topic)}
            />
            <div className="form-grid">
              <Field label="Davomiyligi" hidden={integrated}>
                <select {...register("duration")}>
                  {[30, 45, 60, 90].map((n) => (
                    <option value={n} key={n}>
                      {n} daqiqa
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="O‘quvchilar darajasi" hidden={integrated}>
                <select {...register("level")}>
                  {["Boshlang‘ich", "O‘rta", "Yuqori", "Aralash"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Dars uslubi">
                <select {...register("style")}>
                  {[
                    "An’anaviy",
                    "Interaktiv",
                    "Guruhli",
                    "Amaliy",
                    "Aralash",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Til" hidden={integrated}>
                <select {...register("language")}>
                  <option>O‘zbek</option>
                  <option>Rus</option>
                  <option>Ingliz</option>
                </select>
              </Field>
            </div>
            <Field label="Qo‘shimcha ko‘rsatmalar" hidden={integrated}>
              <textarea
                rows={3}
                placeholder="O‘quvchilaringiz haqida yoki maxsus istaklar…"
                {...register("instructions")}
              />
            </Field>
            <Button className="full" disabled={loading} type="submit">
              <Sparkles size={17} className={loading ? "spin" : ""} />
              {loading
                ? "Dars rejasi tayyorlanmoqda…"
                : "AI yordamida dars yaratish"}
            </Button>
          </form>
        </Card>
        <Card className="lesson-preview">
          {loading ? (
            <Loading />
          ) : sections ? (
            <>
              <div className="preview-head">
                <Badge>Namuna dars rejasi</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEdit((v) => !v)}
                >
                  <Pencil size={15} />
                  {edit ? "Tayyor" : "Tahrirlash"}
                </Button>
              </div>
              <h2>{values.topic}</h2>
              <p>
                {values.subject} · {values.grade}-sinf · {values.duration}{" "}
                daqiqa
              </p>
              <MaterialActions
                topic={values.topic}
                subject={values.subject}
                grade={values.grade}
                onApply={(r) =>
                  setSections([
                    ...sections,
                    {
                      title: "Qo‘shimcha tushuntirish va misol",
                      minutes: 0,
                      content: r.content + "\n" + r.answerKey,
                    },
                  ])
                }
              />
              <LessonContent
                sections={sections}
                edit={edit}
                onChange={setSections}
              />
              <div className="button-row">
                <Button
                  onClick={() => {
                    void save();
                  }}
                  disabled={saved}
                >
                  <Save size={16} />
                  Saqlash
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    void copy(
                      sections
                        .map((s) => s.title + "\n" + s.content)
                        .join("\n\n"),
                    );
                  }}
                >
                  <Copy size={16} />
                  Nusxalash
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    sections &&
                    printDocument(
                      values.topic,
                      sections
                        .map((s) => s.title + "\n" + s.content)
                        .join("\n\n"),
                    )
                  }
                >
                  <Printer size={16} />
                  PDF / Chop etish
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    sections &&
                    exportWord(
                      values.topic,
                      sections
                        .map((s) => s.title + "\n" + s.content)
                        .join("\n\n"),
                    )
                  }
                >
                  Word (.docx)
                </Button>
                <Button variant="ghost" onClick={handleSubmit(generate)}>
                  <RefreshCw size={16} />
                  Qayta yaratish
                </Button>
              </div>
            </>
          ) : (
            <div className="generator-empty">
              <div className="big-ai">
                <Sparkles size={35} />
              </div>
              <h2>Keyingi ajoyib darsingiz</h2>
              <p>
                Chapdagi maydonlarni to‘ldiring.
                <br />
                Tayyor reja shu yerda paydo bo‘ladi.
              </p>
              <div className="preview-checks">
                <span>
                  <Check size={14} />
                  Tuzilgan dars rejasi
                </span>
                <span>
                  <Check size={14} />
                  Interaktiv mashg‘ulotlar
                </span>
                <span>
                  <Check size={14} />
                  Baholash va uy vazifasi
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
export function LessonContent({
  sections,
  edit = false,
  onChange,
}: {
  sections: LessonSection[];
  edit?: boolean;
  onChange?: (s: LessonSection[]) => void;
}) {
  return (
    <div className="document-sections">
      {sections.map((s, i) => (
        <section key={i}>
          <h3>
            <span>{String(i + 1).padStart(2, "0")}</span>
            {s.title}
            {s.minutes > 0 && (
              <small>
                <Clock size={12} />
                {s.minutes} daqiqa
              </small>
            )}
          </h3>
          {edit ? (
            <textarea
              aria-label={s.title}
              rows={4}
              value={s.content}
              onChange={(e) =>
                onChange?.(
                  sections.map((x, j) =>
                    j === i ? { ...x, content: e.target.value } : x,
                  ),
                )
              }
            />
          ) : (
            <p>{s.content}</p>
          )}
        </section>
      ))}
    </div>
  );
}
export function LessonDetails() {
  const { id } = useParams();
  const { db, mutate } = useStore();
  const item = db.lessons.find((l) => l.id === id);
  const [draft, setDraft] = useState<Lesson | null>(null);
  useEffect(() => {
    if (item)
      usePreparation.getState().update({
        subject: item.subject,
        grade: item.grade,
        topic: item.title,
      });
  }, [id]);
  if (!item)
    return (
      <Empty
        title="Dars topilmadi"
        action={<NewLink to="/teacher/lessons/create">Dars yaratish</NewLink>}
      />
    );
  const lesson = draft || item;
  return (
    <>
      <Link className="back-link" to="/teacher/lessons">
        <ArrowLeft size={16} />
        Darslarim
      </Link>
      <PageHead
        title={lesson.title}
        description={`${lesson.subject} · ${lesson.grade}-sinf · ${lesson.duration} daqiqa`}
        action={
          <div className="button-row">
            <Button
              variant="outline"
              onClick={() =>
                printDocument(
                  lesson.title,
                  lesson.sections
                    .map((s) => s.title + "\n" + s.content)
                    .join("\n\n"),
                )
              }
            >
              <Printer size={16} />
              Chop etish / PDF
            </Button>
            <Button
              onClick={() => {
                if (draft) {
                  if (!draft.title.trim()) {
                    toast.error("Dars mavzusini kiriting");
                    return;
                  }
                  mutate((d) => {
                    d.lessons = d.lessons.map((l) => (l.id === id ? draft : l));
                  });
                  setDraft(null);
                  toast.success("Demo o‘zgarishlar saqlandi");
                } else setDraft(structuredClone(item));
              }}
            >
              <Pencil size={16} />
              {draft ? "Saqlash" : "Tahrirlash"}
            </Button>
          </div>
        }
      />
      <MaterialActions
        topic={lesson.title}
        subject={lesson.subject}
        grade={lesson.grade}
        onApply={(r) =>
          setDraft({
            ...lesson,
            sections: [
              ...lesson.sections,
              {
                title: "Qo‘shimcha tushuntirish va misol",
                minutes: 0,
                content: r.content + "\n" + r.answerKey,
              },
            ],
          })
        }
      />
      <Card className="document-card">
        <div className="document-meta">
          <Badge>{lesson.status}</Badge>
          <span>{dateLabel(lesson.date)}</span>
        </div>
        {draft && (
          <Field label="Dars mavzusi">
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </Field>
        )}
        <LessonContent
          sections={lesson.sections}
          edit={!!draft}
          onChange={(sections) => setDraft({ ...lesson, sections })}
        />
        <div className="button-row">
          <Button
            variant="outline"
            onClick={() =>
              exportWord(
                lesson.title,
                lesson.sections
                  .map((s) => s.title + "\n" + s.content)
                  .join("\n\n"),
              )
            }
          >
            Word (.docx)
          </Button>
          <Button asChild>
            <Link
              to={
                "/teacher/quizzes/create?topic=" +
                encodeURIComponent(lesson.title)
              }
            >
              <Sparkles size={16} />
              Test yaratish
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              downloadText(
                lesson.title + ".txt",
                lesson.sections
                  .map((s) => s.title + "\n" + s.content)
                  .join("\n\n"),
              )
            }
          >
            <FileDown size={16} />
            Matnni yuklab olish
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              void copy(lesson.sections.map((s) => s.content).join("\n\n"));
            }}
          >
            <Copy size={16} />
            Nusxalash
          </Button>
        </div>
      </Card>
    </>
  );
}
