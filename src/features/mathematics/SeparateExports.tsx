import { Button } from "@/components/common";
import { printDocument, exportWord } from "@/utils/export";
export default function SeparateExports({
  title,
  content,
  answerKey,
}: {
  title: string;
  content: string;
  answerKey: string;
}) {
  return (
    <section className="separate-exports" aria-label="Alohida eksport">
      <div>
        <b>O‘quvchiga tarqatma</b>
        <Button
          variant="outline"
          size="sm"
          onClick={() => printDocument(title + " — Tarqatma", content)}
        >
          Tarqatma PDF / Chop etish
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportWord(title + " — Tarqatma", content)}
        >
          Tarqatma Word
        </Button>
      </div>
      {answerKey && (
        <div>
          <b>Faqat ustoz uchun</b>
          <Button
            variant="outline"
            size="sm"
            onClick={() => printDocument(title + " — Javoblar", answerKey)}
          >
            Javoblar PDF / Chop etish
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportWord(title + " — Javoblar", answerKey)}
          >
            Javoblar Word
          </Button>
        </div>
      )}
      <p>
        Javoblar tarqatmaga qo‘shilmaydi. PDF uchun chop etish oynasida “Save as
        PDF” ni tanlang. Tahrirdan keyin javoblarni ham tekshiring.
      </p>
    </section>
  );
}
