import { recommendedTopics } from "./curriculum";
import "./mathematics.css";
export default function MathTopicSuggestions({
  grade,
  subject,
  value,
  onSelect,
}: {
  grade: string;
  subject: string;
  value: string;
  onSelect: (s: string) => void;
}) {
  const topics = recommendedTopics(grade, subject);
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
        Erkin mavzu ham kiritishingiz mumkin. Hozir javoblar matematik
        shablonlardan tuziladi.
      </small>
    </div>
  );
}
