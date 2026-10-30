import { taskDocument } from "@/features/mathematics/taskDocument";
import {
  resolveMathTopic,
  makeMathTasks,
  mathLessonSections,
} from "@/features/mathematics/curriculum";
import { delay } from "@/services/api/repository";
import { uid, today } from "@/utils/cn";
import { useStore } from "@/stores/useStore";
import type { LessonSection, Question, DocumentTask } from "@/types";
export interface AIInput {
  topic: string;
  subject: string;
  grade: string;
  duration: number;
  instructions?: string;
  language?: string;
  level?: string;
  style?: string;
  count?: number;
  questionType?: string;
  questionTypes?: string[];
  variant?: number;
  offset?: number;
  variants?: number;
  answerFormat?: "answer" | "steps";
}
export const questionTypes = [
  "Variantli",
  "Bir nechta javob",
  "To‘g‘ri / noto‘g‘ri",
  "Bo‘sh joyni to‘ldirish",
  "Moslashtirish",
  "Qisqa javob",
  "Ochiq savol",
];
export interface AIService {
  generateLesson: (i: AIInput) => Promise<LessonSection[]>;
  generateQuiz: (i: AIInput) => Promise<Question[]>;
  generateDocument: (
    i: AIInput,
    kind: "conspect" | "homework",
  ) => Promise<{ content: string; answerKey: string; tasks?: DocumentTask[] }>;
  generateHomework: (topic: string) => Promise<string>;
  explainTopic: (topic: string) => Promise<string>;
  sendChatMessage: (message: string) => Promise<string>;
}
const usage = (kind: string) =>
  useStore.getState().mutate((d) => {
    d.aiUsage.push({ id: uid(), kind, date: today() });
  });
function validate(i: AIInput) {
  if (!["Matematika", "Algebra", "Geometriya"].includes(i.subject))
    throw new Error("Faqat matematika yo‘nalishlari qo‘llanadi.");
  if (
    !Number.isInteger(i.count ?? 5) ||
    (i.count ?? 5) < 1 ||
    (i.count ?? 5) > 30
  )
    throw new Error("1–30 ta topshiriq tanlang.");
  if (
    !Number.isInteger(i.variants ?? 1) ||
    (i.variants ?? 1) < 1 ||
    (i.variants ?? 1) > 4
  )
    throw new Error("1–4 ta variant tanlang.");
  const result = resolveMathTopic(i.topic, i.subject);
  if (!result.matched)
    throw new Error(
      "Bu mavzu uchun shablon hali yo‘q. Tavsiya qilingan matematik mavzulardan birini tanlang.",
    );
  const grade = Number(i.grade);
  if (!Number.isInteger(grade) || grade < 1 || grade > 11)
    throw new Error("Sinf 1–11 oralig‘ida bo‘lsin.");
  if (grade < result.topic.from)
    throw new Error(
      `Bu shablon ${result.topic.from}-sinfdan boshlab tavsiya etiladi. Sinfingizga mos mavzu tanlang.`,
    );
  if (i.subject !== "Matematika" && result.topic.subject !== i.subject)
    throw new Error("Mavzu va yo‘nalish mos emas. Yo‘nalishni tekshiring.");
  return result.topic;
}
const keyFor = (t: ReturnType<typeof makeMathTasks>[number], i: AIInput) =>
  i.answerFormat === "answer"
    ? t.answer
    : t.steps.join("\n") + "\nJavob: " + t.answer;
export class MockAIService implements AIService {
  async generateLesson(i: AIInput) {
    validate(i);
    usage("Dars rejasi");
    return delay(
      mathLessonSections(
        i.topic,
        i.duration,
        i.subject,
        i.grade,
        i.level,
        i.style,
        i.count,
      ).map((s, n) => ({
        ...s,
        content:
          s.content +
          (n === 0 && i.instructions
            ? "\nUstoz qaydi (avtomatik bajarilmagan): " + i.instructions
            : ""),
      })),
      500,
    );
  }
  async generateQuiz(i: AIInput) {
    const topic = validate(i);
    usage("Test");
    const tasks = makeMathTasks(
      topic,
      (i.count || 5) + (i.offset || 0),
      i.level,
      i.variant || 0,
      i.grade,
    ).slice(i.offset || 0);
    return delay(
      tasks.map((t, n) => {
        const type =
          i.questionTypes?.[n % i.questionTypes.length] ||
          i.questionType ||
          "Variantli";
        const q: Question = {
          id: uid(),
          text: t.prompt,
          type,
          options: [],
          correct: 0,
          correctAnswers: [0],
          answer: t.answer,
          solution: t.steps.join("\n"),
          points: 1,
        };
        if (type === "Variantli") {
          const choices = [t.answer, ...t.wrong];
          const shift = (n + (i.variant || 0)) % 4;
          q.options = choices.slice(shift).concat(choices.slice(0, shift));
          q.correct = (4 - shift) % 4;
          q.correctAnswers = [q.correct];
        } else if (type === "Bir nechta javob") {
          q.text += "\nIkkita to‘g‘ri xulosani tanlang.";
          q.options = [
            `Javob: ${t.answer}`,
            `Javob: ${t.wrong[0]}`,
            `Yechish: ${t.steps.join("; ")}`,
            `Javob: ${t.wrong[1]}`,
          ];
          q.correctAnswers = [0, 2];
        } else if (type === "To‘g‘ri / noto‘g‘ri") {
          const truth = n % 2 === 0;
          q.text += `\nTaklif qilingan javob: ${truth ? t.answer : t.wrong[0]}.`;
          q.options = ["To‘g‘ri", "Noto‘g‘ri"];
          q.correct = truth ? 0 : 1;
          q.answer = q.options[q.correct];
        } else if (type === "Bo‘sh joyni to‘ldirish")
          q.text += "\nNatija: ___.";
        else if (type === "Moslashtirish") {
          q.text = "Masalalarni mos javoblar bilan birlashtiring.";
          const seen = new Set<string>();
          const pool = makeMathTasks(
            topic,
            30,
            i.level,
            (i.variant || 0) + n,
            i.grade,
          )
            .filter((x) => {
              if (seen.has(x.answer)) return false;
              seen.add(x.answer);
              return true;
            })
            .slice(0, 3);
          q.pairs = pool.map((x) => ({ left: x.prompt, right: x.answer }));
          q.solution = pool
            .map((x, j) => `${j + 1}. ${x.steps.join("; ")}`)
            .join("\n");
        } else if (type === "Qisqa javob") {
          q.text += "\nYechimni yozing.";
          q.points = 2;
        } else {
          q.text += "\nYechimni asoslang va natijani tekshiring.";
          q.points = 5;
        }
        return q;
      }),
      500,
    );
  }
  async generateDocument(i: AIInput, kind: "conspect" | "homework") {
    const topic = validate(i);
    usage(kind === "conspect" ? "Konspekt" : "Mashqlar");
    const intro = `${i.subject} · ${i.grade}-sinf\nMavzu: ${i.topic}`;
    if (kind === "conspect") {
      const tasks = makeMathTasks(
          topic,
          (i.count || 5) + 1,
          i.level,
          0,
          i.grade,
        ),
        example = tasks[0];
      return delay(
        {
          content:
            intro +
            `\n\nKirish\n${topic.title} qoidasidan foydalanishni o‘rganamiz.\n\nAsosiy tushuntirish\n${topic.rule}\n\nAsosiy tushunchalar\n${topic.concepts}\n\nYechilgan misol\n${example.prompt}\n${example.steps.join("\n")}\nJavob: ${example.answer}\n\nMustaqil mashqlar\n${tasks
              .slice(1)
              .map((t, n) => `${n + 1}. ${t.prompt}`)
              .join(
                "\n",
              )}\n\nKo‘p uchraydigan xato\n${topic.mistake}\n\nXulosa\n${topic.rule}\n\nTakrorlash savollari\n1. Formuladagi belgilar nimani anglatadi?\n2. Javobni qanday tekshirish mumkin?`,
          answerKey:
            tasks
              .slice(1)
              .map((t, n) => `${n + 1}. ${keyFor(t, i)}`)
              .join("\n\n") +
            (i.instructions
              ? "\n\nUstoz qaydi (avtomatik bajarilmagan): " + i.instructions
              : ""),
        },
        500,
      );
    }
    const tasks: DocumentTask[] = [];
    for (let variant = 0; variant < (i.variants || 1); variant++)
      makeMathTasks(topic, i.count || 5, i.level, variant, i.grade).forEach(
        (task, position) =>
          tasks.push({
            id: uid(),
            variant,
            position,
            prompt: task.prompt,
            answer: task.answer,
            steps: task.steps,
            revision: 0,
          }),
      );
    return delay({ ...taskDocument(i, tasks), tasks }, 500);
  }
  async generateHomework(topic: string) {
    return (
      await this.generateDocument(
        { topic, subject: "Matematika", grade: "8", duration: 45, count: 5 },
        "homework",
      )
    ).content;
  }
  explainTopic(text: string) {
    const topic = validate({
      topic: text,
      subject: "Matematika",
      grade: "8",
      duration: 45,
    });
    const t = topic.make(2);
    return delay(
      `${topic.title}\n${topic.rule}\n\n${t.prompt}\n${t.steps.join("\n")}\nJavob: ${t.answer}`,
    );
  }
  sendChatMessage(message: string) {
    return this.explainTopic(message);
  }
}
// Future Groq/Qwen integration is server-side. No provider keys belong in the browser.
export class BackendAIService implements AIService {
  constructor(private endpoint = "/api/ai") {}
  private async request<T>(action: string, input: unknown): Promise<T> {
    const r = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, input }),
    });
    if (!r.ok) throw new Error("AI xizmati javob bermadi.");
    return r.json();
  }
  generateLesson = (input: AIInput) =>
    this.request<LessonSection[]>("lesson", input);
  generateQuiz = (input: AIInput) => this.request<Question[]>("test", input);
  generateDocument = (input: AIInput, kind: "conspect" | "homework") =>
    this.request<{ content: string; answerKey: string }>(kind, input);
  generateHomework = (topic: string) =>
    this.request<string>("homeworkIdea", { topic });
  explainTopic = (topic: string) =>
    this.request<string>("explanation", { topic });
  sendChatMessage = (message: string) =>
    this.request<string>("chat", { message });
}
export const aiService: AIService = new MockAIService();
