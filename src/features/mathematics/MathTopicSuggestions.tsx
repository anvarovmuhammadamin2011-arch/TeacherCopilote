import { recommendedEnglishTopics } from "@/features/english/curriculum";
import { recommendedTopics } from "./curriculum";
import "./mathematics.css";
export default function MathTopicSuggestions({
  grade,
  subject,
  value,
  onSelect,
  hidden = false,
}: {
  hidden?: boolean;
  grade: string;
  subject: string;
  value: string;
  onSelect: (s: string) => void;
}) {
  if (hidden) return null;
  const topics =
    subject === "Ingliz tili"
      ? recommendedEnglishTopics(grade)
      : recommendedTopics(grade, subject);
  return (
    <div className="math-topic-suggestions">
      <span>{grade}-sinf uchun mavzu namunalari</span>
      <div>
        {topics.map((t) => (
          <button
            type="button"
            key={t.id}
            aria-pressed={value === t.title}
            onClick={() => onSelect(t.title)}
          >
            {t.title}
          </button>
        ))}
      </div>
      <small>
        Erkin mavzu ham kiritishingiz mumkin. Hozir javoblar fan bo‘yicha
        shablonlardan tuziladi.
      </small>
    </div>
  );
}
