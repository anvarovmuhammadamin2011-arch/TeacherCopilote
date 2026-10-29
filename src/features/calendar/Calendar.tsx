import { useState } from "react";
import {
  addMonths,
  addDays,
  addWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
} from "date-fns";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { teacherClasses } from "@/services/api/onboardingRepository";
import { useStore } from "@/stores/useStore";
import { uid, today, monthLabel } from "@/utils/cn";
import type { CalendarEvent } from "@/types";
import {
  PageHead,
  Card,
  Button,
  Badge,
  Field,
  Modal,
  Confirm,
} from "@/components/common";
export default function Calendar({ embedded = false }: { embedded?: boolean }) {
  const { db, mutate } = useStore();
  const [date, setDate] = useState(new Date(today() + "T12:00:00"));
  const [view, setView] = useState("Oy");
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [open, setOpen] = useState(false);
  const days =
    view === "Oy"
      ? eachDayOfInterval({
          start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
          end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
        })
      : view === "Hafta"
        ? eachDayOfInterval({
            start: startOfWeek(date, { weekStartsOn: 1 }),
            end: endOfWeek(date, { weekStartsOn: 1 }),
          })
        : [date];
  const create = (day: string) => {
    setEvent({
      id: uid(),
      title: "",
      date: day,
      time: "09:00",
      type: "Dars",
      description: "",
    });
    setOpen(true);
  };
  const shift = (n: number) =>
    setDate(
      view === "Oy"
        ? addMonths(date, n)
        : view === "Hafta"
          ? addWeeks(date, n)
          : addDays(date, n),
    );
  return (
    <>
      {embedded ? (
        <div className="embedded-page-toolbar">
          <p>Dars, tayyorgarlik va shaxsiy eslatmalar.</p>
          <Button onClick={() => create(format(date, "yyyy-MM-dd"))}>
            <Plus size={16} />
            Tadbir qo‘shish
          </Button>
        </div>
      ) : (
        <PageHead
          title="Dars jadvali"
          description="Vaqtingizni rejalashtiring, muhim ishlarni unutmang."
          action={
            <Button onClick={() => create(format(date, "yyyy-MM-dd"))}>
              <Plus size={16} />
              Tadbir qo‘shish
            </Button>
          }
        />
      )}
      <Card className="calendar-card">
        <div className="calendar-toolbar">
          <div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Oldingi davr"
              onClick={() => shift(-1)}
            >
              <ChevronLeft size={18} />
            </Button>
            <h2>{monthLabel(date)}</h2>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Keyingi davr"
              onClick={() => shift(1)}
            >
              <ChevronRight size={18} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDate(new Date(today() + "T12:00:00"))}
            >
              Bugun
            </Button>
          </div>
          <div className="segmented">
            {["Oy", "Hafta", "Kun"].map((v) => (
              <button
                className={v === view ? "selected" : ""}
                onClick={() => setView(v)}
                key={v}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className={`calendar-grid ${view === "Kun" ? "day-view" : ""}`}>
          {view !== "Kun" &&
            ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"].map((d) => (
              <div className="weekday" key={d}>
                {d}
              </div>
            ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            return (
              <div
                key={key}
                className={`calendar-cell ${!isSameMonth(day, date) ? "outside" : ""} ${isSameDay(day, new Date(today() + "T12:00:00")) ? "is-today" : ""}`}
              >
                <button
                  className="day-number"
                  aria-label={`${key} tadbir qo‘shish`}
                  onClick={() => create(key)}
                >
                  {format(day, "d")}
                  <Plus size={11} />
                </button>
                {db.events
                  .filter((e) => e.date === key)
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((e) => (
                    <button
                      className={`calendar-event ${e.type === "Test" ? "violet" : e.type === "Uchrashuv" ? "orange" : "blue"}`}
                      key={e.id}
                      onClick={() => {
                        setEvent({ ...e });
                        setOpen(true);
                      }}
                    >
                      <span>{e.time}</span>
                      {e.title}
                    </button>
                  ))}
              </div>
            );
          })}
        </div>
      </Card>
      <div className="calendar-legend">
        <Badge>Dars</Badge>
        <Badge tone="violet">Test</Badge>
        <Badge tone="amber">Uchrashuv</Badge>
        <span>Sanani bosib yangi tadbir qo‘shing</span>
      </div>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={
          db.events.some((e) => e.id === event?.id)
            ? "Tadbirni tahrirlash"
            : "Yangi tadbir"
        }
      >
        {event && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutate((d) => {
                const i = d.events.findIndex((x) => x.id === event.id);
                if (i < 0) d.events.push(event);
                else d.events[i] = event;
              });
              setOpen(false);
              toast.success("Demo tadbir saqlandi");
            }}
          >
            <Field label="Tadbir nomi">
              <input
                required
                value={event.title}
                onChange={(e) => setEvent({ ...event, title: e.target.value })}
              />
            </Field>
            <div className="form-grid">
              <Field label="Sana">
                <input
                  type="date"
                  required
                  value={event.date}
                  onChange={(e) => setEvent({ ...event, date: e.target.value })}
                />
              </Field>
              <Field label="Vaqt">
                <input
                  type="time"
                  required
                  value={event.time}
                  onChange={(e) => setEvent({ ...event, time: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Sinf (ixtiyoriy)">
              <select
                value={event.classId || ""}
                onChange={(e) =>
                  setEvent({ ...event, classId: e.target.value || undefined })
                }
              >
                <option value="">Shaxsiy tadbir</option>
                {teacherClasses(db).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Turi">
              <select
                value={event.type}
                onChange={(e) => setEvent({ ...event, type: e.target.value })}
              >
                {[
                  "Dars",
                  "Darsga tayyorgarlik",
                  "Test",
                  "Uchrashuv",
                  "Eslatma",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Tavsif">
              <textarea
                value={event.description}
                onChange={(e) =>
                  setEvent({ ...event, description: e.target.value })
                }
              />
            </Field>
            <div className="button-row">
              <Button>
                <CalendarDays size={16} />
                Saqlash
              </Button>
              {db.events.some((e) => e.id === event.id) && (
                <Confirm
                  onConfirm={() => {
                    mutate((d) => {
                      d.events = d.events.filter((x) => x.id !== event.id);
                    });
                    setOpen(false);
                  }}
                >
                  <Button type="button" variant="danger">
                    <Trash2 size={16} />
                    O‘chirish
                  </Button>
                </Confirm>
              )}
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
