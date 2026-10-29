import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  ClipboardList,
  NotebookPen,
  CalendarDays,
} from "lucide-react";
import { useStore } from "@/stores/useStore";
import { usePreparationContext } from "@/stores/usePreparation";
import { teacherClasses } from "@/services/api/onboardingRepository";
import { documentPath, documentLabel } from "@/features/workspace/subjects";
import TopicBar from "@/features/workspace/TopicBar";
import { today, dateLabel } from "@/utils/cn";
import { Card, CardHead, Badge, Empty } from "@/components/common";
import "@/features/workspace/workspace.css";
export default function Dashboard() {
  const db = useStore((s) => s.db);
  const context = usePreparationContext();
  const upcoming = db.events
    .filter((e) => e.date >= today())
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 3);
  const recent = [
    ...db.lessons.map((x) => ({
      id: x.id,
      title: x.title,
      date: x.date,
      kind: "Dars rejasi",
      href: "/teacher/lessons/" + x.id,
    })),
    ...db.quizzes.map((x) => ({
      id: x.id,
      title: x.title,
      date: x.date,
      kind: "Test",
      href: "/teacher/quizzes/" + x.id,
    })),
    ...db.documents.map((x) => ({
      id: x.id,
      title: x.title,
      date: x.date,
      kind: documentLabel(x.kind),
      href: "/teacher/" + documentPath(x.kind) + "/" + x.id,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
  return (
    <>
      <section className="compact-overview">
        <div>
          <h1>Salom, {db.teacher.firstName} ustoz!</h1>
          <p>
            Mavzuni tanlang. Bugungi darsingiz uchun kerakli materialni
            tayyorlang.
          </p>
        </div>
        <span>Matematika va ingliz tili</span>
      </section>
      <TopicBar />
      <div className="quick-create">
        {[
          {
            title: "Dars rejasi",
            href: "/teacher/prepare?view=plan",
            icon: BookOpen,
            color: "blue",
          },
          {
            title: "Konspekt",
            href: "/teacher/prepare?view=conspect",
            icon: FileText,
            color: "green",
          },
          {
            title: "Test",
            href: "/teacher/tasks?view=test",
            icon: ClipboardList,
            color: "violet",
          },
          {
            title: "Uy vazifasi",
            href: "/teacher/tasks?view=homework",
            icon: NotebookPen,
            color: "orange",
          },
        ].map((t) => (
          <Link key={t.title} to={t.href}>
            <span className={"icon-box " + t.color}>
              <t.icon size={19} />
            </span>
            <div>
              <b>{t.title}</b>
            </div>
            <ArrowUpRight size={15} />
          </Link>
        ))}
      </div>
      <div className="compact-stats">
        <span>
          <b>{teacherClasses(db).length}</b>sinf
        </span>
        <span>
          <b>{db.lessons.length}</b>dars rejasi
        </span>
        <span>
          <b>{db.quizzes.length}</b>test
        </span>
        <span>
          <b>{db.documents.length}</b>konspekt va mashq
        </span>
        <span>
          <b>{db.aiUsage.length}</b>yaratish so‘rovi
        </span>
      </div>
      <div className="two-col compact-recent">
        <Card>
          <CardHead
            title="Oxirgi materiallar"
            action={
              <Link className="text-link" to="/teacher/materials">
                Barchasi <ArrowUpRight size={13} />
              </Link>
            }
          />
          {recent.length ? (
            recent.map((r) => (
              <Link className="activity-link" key={r.href} to={r.href}>
                <span className="activity-dot" />
                <div>
                  <h3>{r.title}</h3>
                  <p>
                    {r.kind} · {dateLabel(r.date)}
                  </p>
                </div>
                <ArrowUpRight size={15} />
              </Link>
            ))
          ) : (
            <Empty
              title="Birinchi materialingizni yarating"
              description={
                context.topic
                  ? `«${context.topic}» uchun yuqoridan material turini tanlang.`
                  : "Yuqorida fan va mavzuni tanlab boshlang."
              }
            />
          )}
        </Card>
        <Card>
          <CardHead
            title="Yaqin darslar"
            action={
              <Link className="text-link" to="/teacher/classes?view=schedule">
                Jadval <ArrowUpRight size={13} />
              </Link>
            }
          />
          {upcoming.length ? (
            upcoming.map((e) => (
              <div className="setting-row" key={e.id}>
                <span className="icon-box blue">
                  <CalendarDays size={18} />
                </span>
                <div className="grow">
                  <h3>{e.title}</h3>
                  <p>
                    {dateLabel(e.date)} · {e.time}
                  </p>
                </div>
                <Badge>{e.type}</Badge>
              </div>
            ))
          ) : (
            <Empty
              title="Dars hali rejalashtirilmagan"
              description="Sinflar va jadval bo‘limida vaqt belgilang."
            />
          )}
        </Card>
      </div>
    </>
  );
}
