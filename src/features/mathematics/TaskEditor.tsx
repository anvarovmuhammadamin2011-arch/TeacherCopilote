import type { TeachingDocument, DocumentTask } from "@/types";
import { Button, Field } from "@/components/common";
import { makeMathTasks, resolveMathTopic } from "./curriculum";
import { taskDocument } from "./taskDocument";
import { toast } from "sonner";
export default function TaskEditor({
  document,
  onChange,
}: {
  document: TeachingDocument;
  onChange: (d: TeachingDocument) => void;
}) {
  const parameters = document.generation;
  if (!parameters || !document.tasks) return null;
  function update(task: DocumentTask) {
    const tasks = document.tasks!.map((t) => (t.id === task.id ? task : t));
    onChange({ ...document, tasks, ...taskDocument(parameters!, tasks) });
  }
  return (
    <section aria-label="Alohida mashqlarni tahrirlash">
      <p className="muted">
        Har bir mashq alohida tahrirlanadi. Matnni o‘zgartirsangiz, ustoz javobi
        va yechimni ham moslang.
      </p>
      {document.tasks.map((t) => (
        <div className="task-editor" key={t.id}>
          <div className="button-row">
            <b>
              {String.fromCharCode(65 + t.variant)} variant · {t.position + 1}
              -mashq
            </b>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                try {
                  const topic = resolveMathTopic(
                    parameters.topic,
                    parameters.subject,
                  ).topic;
                  const next = makeMathTasks(
                    topic,
                    t.position + 1,
                    parameters.level,
                    t.variant + t.revision + 1,
                    parameters.grade,
                  )[t.position];
                  update({
                    ...t,
                    prompt: next.prompt,
                    answer: next.answer,
                    steps: next.steps,
                    revision: t.revision + 1,
                  });
                } catch (e) {
                  toast.error(
                    e instanceof Error ? e.message : "Mashq yangilanmadi.",
                  );
                }
              }}
            >
              Shu mashqni almashtirish
            </Button>
          </div>
          <Field
            label={`${String.fromCharCode(65 + t.variant)} ${t.position + 1}-mashq matni`}
          >
            <textarea
              value={t.prompt}
              onChange={(e) => update({ ...t, prompt: e.target.value })}
            />
          </Field>
          <details>
            <summary>Ustoz javobi va yechimi</summary>
            <Field label="Yakuniy javob">
              <input
                value={t.answer}
                onChange={(e) => update({ ...t, answer: e.target.value })}
              />
            </Field>
            <Field label="Yechim bosqichlari">
              <textarea
                value={t.steps.join("\n")}
                onChange={(e) =>
                  update({ ...t, steps: e.target.value.split("\n") })
                }
              />
            </Field>
          </details>
        </div>
      ))}
    </section>
  );
}
