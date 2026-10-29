import { usePreparation, usePreparationContext } from "@/stores/usePreparation";
import { useStore } from "@/stores/useStore";
import { teacherClasses } from "@/services/api/onboardingRepository";
import { teachingSubjects } from "./subjects";
import MathTopicSuggestions from "@/features/mathematics/MathTopicSuggestions";
import { Field } from "@/components/common";
import { BookOpen } from "lucide-react";
export default function TopicBar() {
  const context = usePreparationContext();
  const update = usePreparation((s) => s.update);
  const db = useStore((s) => s.db);
  const classes = teacherClasses(db);
  return (
    <section className="topic-context" aria-label="Umumiy mavzu">
      <div className="topic-context-heading">
        <span>
          <BookOpen size={17} />
          <b>Bitta mavzu — barcha materiallar</b>
        </span>
        <small>Tanlovingiz bo‘limlar orasida saqlanadi</small>
      </div>
      <div className="topic-context-fields">
        <Field label="Fan">
          <select
            value={context.subject}
            onChange={(e) => update({ subject: e.target.value, topic: "" })}
          >
            {teachingSubjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Sinf">
          <select
            value={context.classId || context.grade}
            onChange={(e) => {
              const c = classes.find((c) => c.id === e.target.value);
              update({
                classId: c?.id || "",
                grade: c
                  ? String(c.grade || parseInt(c.name) || 8)
                  : e.target.value,
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
        <Field label="Mavzu">
          <input
            placeholder={
              context.subject === "Ingliz tili"
                ? "Masalan, Present Simple"
                : "Masalan, chiziqli tenglamalar"
            }
            value={context.topic}
            onChange={(e) => update({ topic: e.target.value })}
          />
        </Field>
        <Field label="Yo‘riqnoma tili">
          <select
            value={context.language}
            onChange={(e) => update({ language: e.target.value })}
          >
            {["O‘zbek", "Rus", "Ingliz"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>
      <MathTopicSuggestions
        grade={context.grade}
        subject={context.subject}
        value={context.topic}
        onSelect={(topic) => update({ topic })}
      />
    </section>
  );
}
