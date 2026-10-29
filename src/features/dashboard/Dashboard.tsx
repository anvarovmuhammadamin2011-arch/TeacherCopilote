import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Sparkles,
  BookOpen,
  ClipboardList,
  School,
  NotebookPen,
  FileSearch,
  FileText,
  CalendarDays,
  Calculator,
} from "lucide-react";
import { useStore } from "@/stores/useStore";
import { teacherClasses } from "@/services/api/onboardingRepository";
import { today, dateLabel } from "@/utils/cn";
import {
  PageHead,
  Card,
  CardHead,
  Button,
  Badge,
  Empty,
} from "@/components/common";
export const tools = [
  {
    title: "Dars rejasi",
    description: "Qoida, yechilgan misol va amaliy mashq",
    path: "lessons/create",
    icon: BookOpen,
    color: "blue",
  },
  {
    title: "Test yaratish",
    description: "7 savol turi va javob kalitlari",
    path: "quizzes/create",
    icon: ClipboardList,
    color: "violet",
  },
  {
    title: "Konspekt",
    description: "Formulalar, ta’riflar va yechilgan misollar",
    path: "conspects",
    icon: FileText,
    color: "green",
  },
  {
    title: "Uy vazifasi",
    description: "Mavzuga mos masalalar va bosqichli yechimlar",
    path: "homework",
    icon: NotebookPen,
    color: "orange",
  },
  {
    title: "PDF tahlil",
    description: "Hujjatlar bilan ishlash maydoni",
    path: "pdf-analyzer",
    icon: FileSearch,
    color: "blue",
  },
  {
    title: "AI yordamchi",
    description: "Matematik qoidalar va yechim namunalari",
    path: "ai-assistant",
    icon: Sparkles,
    color: "violet",
  },
];
export default function Dashboard() {
  const db = useStore((s) => s.db);
  const upcoming = db.events
    .filter((e) => e.date >= today())
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 4);
  const recent = [
    ...db.lessons.map((x) => ({
      id: x.id,
      title: x.title,
      date: x.date,
      type: "Dars rejasi",
      path: "lessons/" + x.id,
    })),
    ...db.quizzes.map((x) => ({
      id: x.id,
      title: x.title,
      date: x.date,
      type: "Test",
      path: "quizzes/" + x.id,
    })),
    ...db.documents.map((x) => ({
      id: x.id,
      title: x.title,
      date: x.date,
      type: x.kind === "homework" ? "Uy vazifasi" : "Konspekt",
      path: (x.kind === "homework" ? "homework/" : "conspects/") + x.id,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
  return (
    <>
      <PageHead
        eyebrow="MATEMATIKA USTOZI ISH MAYDONI"
        title={`Salom, ${db.teacher.firstName} ustoz!`}
        description="Matematika, algebra va geometriya darslariga tayyorlanamiz."
      />
      <section className="teacher-hero">
        <div>
          <span className="eyebrow">G‘OYALARINGIZGA QANOT BERING</span>
          <h2>
            Aniq formulalar.
            <br />
            Puxta darslar.
          </h2>
          <p>
            Dars rejalari, testlar va materiallaringiz —<br />
            barchasi bitta qulay ish maydonida.
          </p>
          <Button asChild>
            <Link to="/teacher/lessons/create">
              <Sparkles size={17} />
              Dars rejasini yaratish
              <ArrowUpRight size={16} />
            </Link>
          </Button>
        </div>
        <div className="hero-notebook" aria-hidden="true">
          <span>MATEMATIKA DARSI</span>
          <Calculator size={44} />
          <b>
            Yaxshi reja —<br />
            yaxshi boshlanish.
          </b>
          <i />
          <i />
          <i />
        </div>
      </section>
      <div className="teacher-stats">
        {[
          {
            label: "Jami sinflar",
            value: teacherClasses(db).length,
            icon: School,
          },
          {
            label: "Yaratilgan darslar",
            value: db.lessons.length,
            icon: BookOpen,
          },
          {
            label: "Yaratilgan testlar",
            value: db.quizzes.length,
            icon: ClipboardList,
          },
          { label: "AI so‘rovlari", value: db.aiUsage.length, icon: Sparkles },
        ].map((s) => (
          <Card key={s.label}>
            <span className="icon-box blue">
              <s.icon size={20} />
            </span>
            <strong>{s.value}</strong>
            <p>{s.label}</p>
          </Card>
        ))}
      </div>
      <CardHead
        title="Keyingi g‘oyangiz shu yerdan boshlanadi"
        subtitle="AI vositasini tanlang, natijani o‘z uslubingizga moslang."
      />
      <div className="tool-grid">
        {tools.map((t) => (
          <Link className="tool-card" to={"/teacher/" + t.path} key={t.path}>
            <span className={"icon-box " + t.color}>
              <t.icon size={23} />
            </span>
            <h3>
              {t.title}
              <ArrowUpRight size={16} />
            </h3>
            <p>{t.description}</p>
          </Link>
        ))}
      </div>
      <div className="two-col">
        <Card>
          <CardHead
            title="Yaqinlashayotgan darslar"
            action={
              <Link className="text-link" to="/teacher/calendar">
                Jadval <ArrowUpRight size={14} />
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
              title="Jadvalingiz ochiq"
              description="Keyingi dars yoki eslatmani qo‘shing."
            />
          )}
        </Card>
        <Card>
          <CardHead
            title="So‘nggi faoliyat"
            action={
              <Link className="text-link" to="/teacher/materials">
                Materiallar <ArrowUpRight size={14} />
              </Link>
            }
          />
          {recent.length ? (
            recent.map((r) => (
              <Link
                className="activity-link"
                to={"/teacher/" + r.path}
                key={r.type + r.id}
              >
                <span className="activity-dot" />
                <div>
                  <h3>{r.title}</h3>
                  <p>
                    {r.type} · {dateLabel(r.date)}
                  </p>
                </div>
                <ArrowUpRight size={16} />
              </Link>
            ))
          ) : (
            <Empty title="Birinchi hujjatingizni yarating" />
          )}
        </Card>
      </div>
      <Card className="productivity-strip">
        <div>
          <h3>Shaxsiy faolligingiz</h3>
          <p>
            {db.documents.filter((d) => d.kind === "homework").length} ta uy
            vazifasi ·{" "}
            {db.documents.filter((d) => d.kind === "conspect").length} ta
            konspekt · {db.materials.length} ta qo‘shilgan material
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/teacher/statistics">Statistikani ochish</Link>
        </Button>
      </Card>
    </>
  );
}
