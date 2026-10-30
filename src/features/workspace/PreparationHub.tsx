import { useEffect, Suspense, lazy } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  FileText,
  ClipboardList,
  NotebookPen,
  PenLine,
} from "lucide-react";
import { usePreparation, usePreparationContext } from "@/stores/usePreparation";
import { PageHead, Loading } from "@/components/common";
import TopicBar from "./TopicBar";
import "./workspace.css";
const LessonCreate = lazy(() =>
  import("@/features/lessons/Lessons").then((m) => ({
    default: m.LessonCreate,
  })),
);
const QuizCreate = lazy(() =>
  import("@/features/quizzes/Quizzes").then((m) => ({ default: m.QuizCreate })),
);
const Documents = lazy(() => import("@/features/documents/Documents"));
export default function PreparationHub({
  section = "prepare",
  initialView,
}: {
  section?: "prepare" | "tasks";
  initialView?: string;
}) {
  const [params, setParams] = useSearchParams();
  const context = usePreparationContext();
  const update = usePreparation((s) => s.update);
  const views =
    section === "prepare"
      ? [
          { id: "plan", label: "Dars rejasi", icon: BookOpen },
          { id: "conspect", label: "Konspekt", icon: FileText },
        ]
      : [
          { id: "test", label: "Test", icon: ClipboardList },
          { id: "assessment", label: "Nazorat ishi", icon: ClipboardList },
          { id: "exercise", label: "Mashq", icon: PenLine },
          { id: "homework", label: "Uy vazifasi", icon: NotebookPen },
        ];
  const selected = params.get("view") || initialView || views[0].id;
  const view = views.some((v) => v.id === selected) ? selected : views[0].id;
  useEffect(() => {
    const topic = params.get("topic");
    if (topic) update({ topic });
  }, [params.get("topic")]);
  return (
    <>
      <PageHead
        title={section === "prepare" ? "Dars tayyorlash" : "Topshiriqlar"}
        description={
          section === "prepare"
            ? "Bir mavzu asosida dars rejasi va tushuntirish tayyorlang."
            : "Mashq, test, nazorat ishi va uy vazifasi — aniq misollar va alohida javoblar."
        }
        action={
          <Link
            className="text-link"
            to={section === "prepare" ? "/teacher/tasks" : "/teacher/prepare"}
          >
            Shu mavzudan {section === "prepare" ? "topshiriq" : "dars"}{" "}
            tayyorlash <ArrowRight size={14} />
          </Link>
        }
      />
      <TopicBar full />
      <div className="workspace-tabs" role="group" aria-label="Material turi">
        {views.map((v) => (
          <button
            key={v.id}
            aria-pressed={view === v.id}
            onClick={() => setParams({ view: v.id })}
          >
            <v.icon size={17} />
            {v.label}
          </button>
        ))}
      </div>
      <p className="workspace-mock-note">
        Namuna generatori: hozir mahalliy shablonlardan foydalaniladi. Natijani
        tekshiring, tahrirlang va saqlang. Sozlamalar o‘zgarsa, oldingi natija
        o‘z parametrlari bilan saqlanadi. Yangi material uchun yaratish
        tugmasini bosing.
      </p>
      <div className="integrated-tool">
        {context.topic.trim().length < 3 ? (
          <div className="workspace-start">
            <BookOpen size={27} />
            <h2>Qaysi mavzuni tayyorlaymiz?</h2>
            <p>Yuqorida mavzu nomini yozing yoki namuna mavzuni tanlang.</p>
          </div>
        ) : (
          <Suspense fallback={<Loading />}>
            <div className="workspace-panels">
              <div hidden={view !== "plan"}>
                <LessonCreate integrated />
              </div>
              <div hidden={view !== "conspect"}>
                <Documents kind="conspect" integrated />
              </div>
              <div hidden={view !== "test"}>
                <QuizCreate integrated />
              </div>
              <div hidden={view !== "assessment"}>
                <QuizCreate integrated assessment />
              </div>
              <div hidden={view !== "exercise"}>
                <Documents kind="exercise" integrated />
              </div>
              <div hidden={view !== "homework"}>
                <Documents kind="homework" integrated />
              </div>
            </div>
          </Suspense>
        )}
      </div>
    </>
  );
}
