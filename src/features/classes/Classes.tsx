import { mathSubjects, isMathSubject } from "@/features/mathematics/curriculum";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Plus, Pencil, Trash2, CalendarDays, School } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/stores/useStore";
import {
  teacherClasses,
  classSubjects,
  classWeeklyHours,
  activeTeacherId,
} from "@/services/api/onboardingRepository";
import { uid } from "@/utils/cn";
import type { ClassRoom } from "@/types";
import {
  PageHead,
  Card,
  Button,
  Field,
  Modal,
  Confirm,
  Empty,
  SearchInput,
  Badge,
} from "@/components/common";
export function Classes() {
  const { db, mutate } = useStore();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<ClassRoom | null>(null);
  const [rows, setRows] = useState<{ subject: string; weeklyHours: number }[]>(
    [],
  );
  const list = teacherClasses(db).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );
  function open(c?: ClassRoom) {
    setDraft(
      c
        ? { ...c }
        : {
            id: uid(),
            name: "",
            subject: db.teacher.subject,
            grade: 8,
            year: "2026–2027",
            description: "",
            schoolName: db.teacher.school,
          },
    );
    setRows(
      c
        ? db.teacherClassAssignments
            .filter(
              (a) =>
                a.teacherId === activeTeacherId(db) &&
                a.classId === c.id &&
                !a.archived,
            )
            .map((a) => ({ subject: a.subject, weeklyHours: a.weeklyHours }))
        : [{ subject: db.teacher.subject, weeklyHours: 4 }],
    );
  }
  return (
    <>
      <PageHead
        title="Sinflarim"
        description="AI vositalari va dars jadvalingizni shaxsiylashtiring."
        action={
          <Button onClick={() => open()}>
            <Plus size={16} />
            Sinf qo‘shish
          </Button>
        }
      />
      <SearchInput value={search} onChange={setSearch} />
      <div className="resource-grid">
        {list.map((c) => (
          <Card key={c.id}>
            <span className="icon-box blue">
              <School size={24} />
            </span>
            <h2>
              <Link to={"/teacher/classes/" + c.id}>{c.name}</Link>
            </h2>
            <p>{classSubjects(db, c.id).join(" · ")}</p>
            <Badge>{classWeeklyHours(db, c.id)} soat / hafta</Badge>
            <p>{c.year}</p>
            <div className="button-row">
              <Button asChild variant="outline">
                <Link to={"/teacher/classes/" + c.id}>Jadvalni ko‘rish</Link>
              </Button>
              <Button
                variant="ghost"
                aria-label={c.name + "ni tahrirlash"}
                onClick={() => open(c)}
              >
                <Pencil size={16} />
              </Button>
              <Confirm
                title="Sinf olib tashlansinmi?"
                description="Saqlangan dars va test hujjatlari qoladi. Sinfga biriktirilgan jadval tadbirlari umumiy tadbirga aylanadi."
                onConfirm={() =>
                  mutate((d) => {
                    d.classes = d.classes.filter((x) => x.id !== c.id);
                    d.teacherClassAssignments =
                      d.teacherClassAssignments.filter(
                        (a) => a.classId !== c.id,
                      );
                    d.events.forEach((e) => {
                      if (e.classId === c.id) delete e.classId;
                    });
                  })
                }
              >
                <Button variant="ghost" aria-label={c.name + "ni o‘chirish"}>
                  <Trash2 size={16} />
                </Button>
              </Confirm>
            </div>
          </Card>
        ))}
      </div>
      {!list.length && (
        <Empty
          title="Sinf qo‘shib boshlang"
          description="Faqat sinf nomi, fan va haftalik soat kerak."
        />
      )}
      <Modal
        open={!!draft}
        onOpenChange={(v) => {
          if (!v) setDraft(null);
        }}
        title={
          db.classes.some((c) => c.id === draft?.id)
            ? "Sinfni tahrirlash"
            : "Yangi sinf"
        }
      >
        {draft && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                db.classes.some(
                  (c) =>
                    c.id !== draft.id &&
                    c.name.toLowerCase() === draft.name.trim().toLowerCase() &&
                    c.year === draft.year,
                )
              ) {
                toast.error("Bu sinf mavjud.");
                return;
              }
              if (
                !rows.length ||
                rows.some(
                  (r) =>
                    !isMathSubject(r.subject) ||
                    r.weeklyHours < 1 ||
                    r.weeklyHours > 40,
                ) ||
                new Set(rows.map((r) => r.subject.trim().toLowerCase()))
                  .size !== rows.length
              ) {
                toast.error("Fanlar takrorlanmasin, soatlar 1–40 bo‘lsin.");
                return;
              }
              mutate((d) => {
                const value = {
                  ...draft,
                  name: draft.name.trim(),
                  subject: rows[0].subject,
                };
                const i = d.classes.findIndex((c) => c.id === draft.id);
                if (i < 0) d.classes.push(value);
                else d.classes[i] = value;
                d.teacherClassAssignments = d.teacherClassAssignments.filter(
                  (a) =>
                    !(
                      a.classId === draft.id &&
                      a.teacherId === activeTeacherId(d)
                    ),
                );
                rows.forEach((r) =>
                  d.teacherClassAssignments.push({
                    id: uid(),
                    teacherId: activeTeacherId(d),
                    classId: draft.id,
                    subject: r.subject.trim(),
                    weeklyHours: r.weeklyHours,
                    archived: false,
                  }),
                );
              });
              setDraft(null);
              toast.success("Sinf saqlandi");
            }}
          >
            <div className="form-grid">
              <Field label="Sinf nomi">
                <input
                  required
                  value={draft.name}
                  placeholder="8-A"
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </Field>
              <Field label="Bosqich">
                <input
                  type="number"
                  required
                  min={1}
                  max={11}
                  value={draft.grade || 8}
                  onChange={(e) =>
                    setDraft({ ...draft, grade: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
            <Field label="O‘quv yili">
              <input
                required
                value={draft.year}
                onChange={(e) => setDraft({ ...draft, year: e.target.value })}
              />
            </Field>
            <Field label="Izoh">
              <textarea
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
              />
            </Field>
            <h3>Fanlar va haftalik soatlar</h3>
            {rows.map((r, i) => (
              <div className="option-edit" key={i}>
                <Field label="Fan">
                  <select
                    required
                    value={r.subject}
                    onChange={(e) =>
                      setRows(
                        rows.map((x, n) =>
                          n === i ? { ...x, subject: e.target.value } : x,
                        ),
                      )
                    }
                  >
                    {mathSubjects.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Soat">
                  <input
                    type="number"
                    min={1}
                    max={40}
                    required
                    value={r.weeklyHours}
                    onChange={(e) =>
                      setRows(
                        rows.map((x, n) =>
                          n === i
                            ? { ...x, weeklyHours: Number(e.target.value) }
                            : x,
                        ),
                      )
                    }
                  />
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  aria-label="Fanni olib tashlash"
                  disabled={rows.length === 1}
                  onClick={() => setRows(rows.filter((_, n) => n !== i))}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <div className="button-row">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setRows([
                    ...rows,
                    {
                      subject:
                        mathSubjects.find(
                          (s) => !rows.some((r) => r.subject === s),
                        ) || "Matematika",
                      weeklyHours: 1,
                    },
                  ])
                }
              >
                Fan qo‘shish
              </Button>
              <Button>Saqlash</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
export function ClassDetails() {
  const { id } = useParams();
  const db = useStore((s) => s.db);
  const c = teacherClasses(db).find((c) => c.id === id);
  if (!c) return <Empty title="Sinf topilmadi" />;
  const events = db.events
    .filter((e) => e.classId === id)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return (
    <>
      <PageHead
        title={c.name}
        description={c.description}
        action={
          <Button asChild>
            <Link to="/teacher/calendar">
              <CalendarDays size={16} />
              Jadvalni boshqarish
            </Link>
          </Button>
        }
      />
      <div className="two-col">
        <Card>
          <h2>Dars beriladigan fanlar</h2>
          {db.teacherClassAssignments
            .filter(
              (a) =>
                a.classId === id &&
                a.teacherId === activeTeacherId(db) &&
                !a.archived,
            )
            .map((a) => (
              <div className="setting-row" key={a.id}>
                <b>{a.subject}</b>
                <Badge>{a.weeklyHours} soat / hafta</Badge>
              </div>
            ))}
          <p>{c.year} o‘quv yili</p>
          <Button asChild variant="outline">
            <Link to="/teacher/classes">Sinfni tahrirlash</Link>
          </Button>
        </Card>
        <Card>
          <h2>Sinf jadvali</h2>
          {events.length ? (
            events.map((e) => (
              <div className="setting-row" key={e.id}>
                <div>
                  <b>{e.title}</b>
                  <p>
                    {e.date} · {e.time}
                  </p>
                </div>
                <Badge>{e.type}</Badge>
              </div>
            ))
          ) : (
            <Empty title="Dars hali rejalashtirilmagan" />
          )}
        </Card>
      </div>
    </>
  );
}
