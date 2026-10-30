import { usePreparation, usePreparationContext } from "@/stores/usePreparation";
import { useStore } from "@/stores/useStore";
import { teacherClasses } from "@/services/api/onboardingRepository";
import { mathDirections } from "./subjects";
import MathTopicSuggestions from "@/features/mathematics/MathTopicSuggestions";
import { Field } from "@/components/common";
import { BookOpen, SlidersHorizontal } from "lucide-react";
import SourceUpload from "./SourceUpload";
export default function TopicBar({ full = false }: { full?: boolean }) {
  const c = usePreparationContext();
  const update = usePreparation((s) => s.update);
  const classes = teacherClasses(useStore((s) => s.db));
  return (
    <section className="topic-context" aria-label="Umumiy mavzu">
      <div className="topic-context-heading">
        <span>
          <BookOpen size={17} />
          <b>Bitta mavzu — tayyor dars materiallari</b>
        </span>
        <small>Matematika · tanlovingiz saqlanadi</small>
      </div>
      <div className="topic-context-fields">
        <Field label="Sinf">
          <select
            value={c.classId || c.grade}
            onChange={(e) => {
              const room = classes.find((x) => x.id === e.target.value);
              update({
                classId: room?.id || "",
                grade: room
                  ? String(room.grade || parseInt(room.name) || 8)
                  : e.target.value,
                ...(room?.currentTopic ? { topic: room.currentTopic } : {}),
              });
            }}
          >
            {classes.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
            {Array.from({ length: 11 }, (_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}-sinf
              </option>
            ))}
          </select>
        </Field>
        <Field label="Yo‘nalish">
          <select
            value={c.subject}
            onChange={(e) => update({ subject: e.target.value, topic: "" })}
          >
            {mathDirections.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Mavzu">
          <input
            value={c.topic}
            placeholder="Masalan, chiziqli tenglamalar"
            onChange={(e) => update({ topic: e.target.value })}
          />
        </Field>
        <Field label="Dars vaqti (daqiqa)">
          <select
            value={c.duration}
            onChange={(e) => update({ duration: Number(e.target.value) })}
          >
            {[30, 45, 60, 90].map((n) => (
              <option key={n} value={n}>
                {n} daqiqa
              </option>
            ))}
          </select>
        </Field>
      </div>
      <MathTopicSuggestions
        grade={c.grade}
        subject={c.subject}
        value={c.topic}
        onSelect={(topic) => update({ topic })}
      />
      {full && (
        <>
          <details className="math-options" open>
            <summary>
              <SlidersHorizontal size={15} />
              Material sozlamalari
            </summary>
            <div className="math-options-grid">
              <Field label="Qiyinlik">
                <select
                  value={c.level}
                  onChange={(e) => update({ level: e.target.value })}
                >
                  {["Oson", "O‘rta", "Murakkab", "Aralash"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Topshiriqlar soni">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={c.count}
                  onChange={(e) => update({ count: Number(e.target.value) })}
                />
              </Field>
              <Field label="Variantlar soni">
                <select
                  value={c.variants}
                  onChange={(e) => update({ variants: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Ustoz javoblari">
                <select
                  value={c.answerFormat}
                  onChange={(e) =>
                    update({
                      answerFormat: e.target.value as "answer" | "steps",
                    })
                  }
                >
                  <option value="answer">Faqat javob</option>
                  <option value="steps">Bosqichma-bosqich yechim</option>
                </select>
              </Field>
            </div>
            <p className="muted">
              Son va variantlar test, nazorat ishi, mashq va uy vazifasiga
              qo‘llanadi. Javoblar tarqatma varaqdan alohida saqlanadi.
            </p>
            <Field label="Qo‘shimcha ko‘rsatma / darslik sahifasi">
              <textarea
                rows={2}
                maxLength={1500}
                value={c.instructions}
                onChange={(e) => update({ instructions: e.target.value })}
                placeholder="Masalan, darslikning 52-sahifasi. Maxsus ko‘rsatmalar hozir hujjatga ustoz qaydi sifatida qo‘shiladi."
              />
            </Field>
          </details>
          <SourceUpload />
        </>
      )}
    </section>
  );
}
