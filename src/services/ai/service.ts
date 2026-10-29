import {
  resolveMathTopic,
  makeMathTasks,
  mathLessonSections,
} from "@/features/mathematics/curriculum";
import { delay } from "@/services/api/repository";
import { uid, today } from "@/utils/cn";
import { useStore } from "@/stores/useStore";
import type { LessonSection, Question } from "@/types";
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
  ) => Promise<{ content: string; answerKey: string }>;
  generateHomework: (topic: string) => Promise<string>;
  explainTopic: (topic: string) => Promise<string>;
  sendChatMessage: (message: string) => Promise<string>;
}
const usage = (kind: string) =>
  useStore.getState().mutate((d) => {
    d.aiUsage.push({ id: uid(), kind, date: today() });
  });
export class MockAIService implements AIService {
  async generateLesson(i: AIInput) {
    usage("Dars rejasi");
    return delay(
      mathLessonSections(
        i.topic,
        i.duration,
        i.subject,
        i.grade,
        i.level,
        i.style,
      ).map((s, n) => ({
        ...s,
        content:
          s.content +
          (n === 0
            ? `\nTil: ${i.language || "O‘zbek"}. ${i.instructions || ""}`
            : ""),
      })),
      700,
    );
  }
  async generateQuiz(i: AIInput) {
    usage("Test");
    const { topic, matched } = resolveMathTopic(i.topic, i.subject);
    const tasks = makeMathTasks(
      topic,
      i.count || 7,
      i.level,
      i.variant || 0,
      i.grade,
    );
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
          points: 1,
        };
        if (!matched && n === 0)
          q.text = `Namuna mavzu: ${topic.title}.\n` + q.text;
        if (type === "Variantli") {
          const choices = [t.answer, ...t.wrong];
          const shift = (n + (i.variant || 0)) % 4;
          q.options = choices.slice(shift).concat(choices.slice(0, shift));
          q.correct = (4 - shift) % 4;
          q.correctAnswers = [q.correct];
        } else if (type === "Bir nechta javob") {
          q.text = t.prompt + "\nIkkita to‘g‘ri xulosani tanlang.";
          q.options = [
            `Javob: ${t.answer}`,
            `Javob: ${t.wrong[0]}`,
            `Yechish: ${t.steps.join("; ")}`,
            `Javob: ${t.wrong[1]}`,
          ];
          q.correctAnswers = [0, 2];
        } else if (type === "To‘g‘ri / noto‘g‘ri") {
          const truth = n % 2 === 0;
          q.text =
            t.prompt +
            `\nTaklif qilingan javob: ${truth ? t.answer : t.wrong[0]}.`;
          q.options = ["To‘g‘ri", "Noto‘g‘ri"];
          q.correct = truth ? 0 : 1;
        } else if (type === "Bo‘sh joyni to‘ldirish") {
          q.text += "\nNatija: ___.";
        } else if (type === "Moslashtirish") {
          q.text = "Masalalarni mos javoblar bilan birlashtiring.";
          const pool = makeMathTasks(
            topic,
            25,
            i.level,
            i.variant || 0,
            i.grade,
          );
          const seen = new Set<string>();
          q.pairs = pool
            .filter((item) => {
              if (seen.has(item.answer)) return false;
              seen.add(item.answer);
              return true;
            })
            .slice(0, 3)
            .map((item) => ({ left: item.prompt, right: item.answer }));
        } else if (type === "Qisqa javob") {
          q.text += "\nYechishning asosiy bosqichlarini yozing.";
          q.answer = t.steps.join("\n") + `\nJavob: ${t.answer}`;
          q.points = 2;
        } else {
          q.text +=
            "\nYechimni asoslang, tekshirish usulini yozing va ishlatilgan qoidani izohlang.";
          q.answer =
            t.steps.join("\n") +
            `\nJavob: ${t.answer}\nMezon: qoida va usul (2), hisob (2), tekshirish (1).`;
          q.points = 5;
        }
        return q;
      }),
      750,
    );
  }
  async generateDocument(i: AIInput, kind: "conspect" | "homework") {
    usage(kind === "conspect" ? "Konspekt" : "Uy vazifasi");
    const { topic, matched } = resolveMathTopic(i.topic, i.subject);
    const tasks = makeMathTasks(topic, i.count || 5, i.level, 0, i.grade);
    const intro =
      `${i.subject} · ${i.grade}-sinf · ${i.language || "O‘zbek"}\nMavzu: ${i.topic}` +
      (!matched
        ? `\nMaxsus shablon topilmadi. Namuna yo‘nalish: ${topic.title}.`
        : "");
    if (kind === "conspect") {
      const example = tasks[0];
      return delay(
        {
          content:
            intro +
            `\n\nKirish\n${topic.title} mavzusida formuladan to‘g‘ri foydalanish va javobni tekshirishni o‘rganamiz.\n\nAsosiy tushuntirish\n${topic.rule}\n${i.level === "Batafsil" ? "Har bir almashtirishni asoslang va natijani teskari amal yoki ta’rif bilan tekshiring." : ""}\n\nAsosiy tushunchalar\n${topic.concepts}\n\nYechilgan misol\n${example.prompt}\n${example.steps.join("\n")}\nJavob: ${example.answer}\n\nMustaqil mashqlar\n${tasks
              .slice(1, i.level === "Qisqa" ? 3 : 5)
              .map((t, n) => `${n + 1}. ${t.prompt}`)
              .join(
                "\n",
              )}\n\nKo‘p uchraydigan xato\n${topic.mistake}\n\nXulosa\n${topic.rule}\n\nTakrorlash savollari\n1. Formuladagi belgilar nimani anglatadi?\n2. ${tasks[1]?.prompt || tasks[0].prompt}\n3. Javobni qanday tekshirish mumkin?`,
          answerKey: "",
        },
        650,
      );
    }
    return delay(
      {
        content:
          intro +
          `\nQiyinlik: ${i.level || "O‘rta"}\n\nKo‘rsatma\nQoida: ${topic.rule}\nHar bir mashq uchun yechim bosqichlarini va yakuniy javobni yozing.\n\nMashqlar\n` +
          tasks.map((t, n) => `${n + 1}. ${t.prompt}`).join("\n"),
        answerKey: tasks
          .map((t, n) => `${n + 1}. ${t.answer}\n${t.steps.join("\n")}`)
          .join("\n\n"),
      },
      650,
    );
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
    const { topic } = resolveMathTopic(text);
    const t = topic.make(2);
    return delay(
      `${topic.title}\n${topic.rule}\n\nNamuna: ${t.prompt}\n${t.steps.join("\n")}\nJavob: ${t.answer}`,
    );
  }
  sendChatMessage(message: string) {
    usage("AI yordamchi");
    const { topic, matched } = resolveMathTopic(message);
    const t = topic.make(2);
    return delay(
      `Matematika yordamchisi · namunaviy javob\n\n${matched ? topic.title : "So‘rov uchun yaqin matematik namuna: " + topic.title}\n\nQoida\n${topic.rule}\n\nYechilgan misol (so‘rovingizdagi masalaning avtomatik yechimi emas)\n${t.prompt}\n${t.steps.join("\n")}\nJavob: ${t.answer}\n\nDarsda qo‘llash\n1. Belgilar va formulani doskada izohlang.\n2. Juftliklarda o‘xshash misol yeching.\n3. Xatoni topish mashqi: ${topic.mistake}\n\nBu mahalliy matematik shablon. Erkin masalalarni tahlil qiladigan haqiqiy AI hali ulanmagan.`,
      650,
    );
  }
}
// Future provider implements the same interface via a server endpoint. Never put Groq/Qwen keys in the client.
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
