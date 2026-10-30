import { useState } from "react";
import { Lightbulb, WandSparkles, Plus } from "lucide-react";
import { Button } from "@/components/common";
import { makeMathTasks, resolveMathTopic } from "./curriculum";
interface Result {
  content: string;
  answerKey: string;
}
export default function MaterialActions({
  topic,
  subject,
  grade,
  onApply,
}: {
  topic: string;
  subject: string;
  grade: string;
  onApply: (result: Result) => void;
}) {
  const [result, setResult] = useState<Result | null>(null);
  const [sequence, setSequence] = useState(10);
  function run(action: string) {
    const resolved = resolveMathTopic(topic, subject);
    if (!resolved.matched) {
      setResult({
        content:
          "Bu mavzu uchun shablon hali yo‘q. Tavsiya qilingan mavzuni tanlang.",
        answerKey: "",
      });
      return;
    }
    const task = makeMathTasks(
      resolved.topic,
      1,
      action === "Osonlashtir" ? "Oson" : "O‘rta",
      action === "Osonlashtir" ? 0 : sequence,
      grade,
    )[0];
    setSequence(sequence + 1);
    setResult({
      content:
        (action === "Tushuntir"
          ? `${resolved.topic.title}\n${resolved.topic.rule}\n\nMisol\n`
          : "") + task.prompt,
      answerKey: task.steps.join("\n") + "\nJavob: " + task.answer,
    });
  }
  return (
    <section className="material-actions" aria-label="Material yordamchisi">
      <div>
        <Lightbulb size={17} />
        <b>Shu mavzu ustida ishlash</b>
      </div>
      <p>
        Tanlangan mavzu uchun shablonli yordam. Tahrirlangan erkin misolni
        avtomatik tahlil qilmaydi.
      </p>
      <div className="button-row">
        {["Tushuntir", "Osonlashtir", "O‘xshash misol yarat"].map((s) => (
          <Button key={s} size="sm" variant="outline" onClick={() => run(s)}>
            <WandSparkles size={14} />
            {s}
          </Button>
        ))}
      </div>
      {result && (
        <div className="material-action-result">
          <pre>{result.content}</pre>
          <details>
            <summary>Ustoz uchun yechim</summary>
            <pre>{result.answerKey}</pre>
          </details>
          <Button
            size="sm"
            disabled={!result.answerKey}
            onClick={() => {
              onApply(result);
              setResult(null);
            }}
          >
            <Plus size={14} />
            Materialga qo‘shish
          </Button>
        </div>
      )}
    </section>
  );
}
