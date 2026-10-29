import type { Question, LessonSection } from "@/types";
import type { AIInput } from "@/services/ai/service";
import { uid } from "@/utils/cn";
export interface EnglishTask {
  prompt: string;
  answer: string;
  wrong: string[];
  explanation: string;
}
interface EnglishTopic {
  id: string;
  title: string;
  from: number;
  pattern: RegExp;
  rule: string;
  mistake: string;
  items: EnglishTask[];
  pairs: { left: string; right: string }[];
}
const item = (
  prompt: string,
  answer: string,
  wrong: string[],
  explanation: string,
): EnglishTask => ({ prompt, answer, wrong, explanation });
export const englishTopics: EnglishTopic[] = [
  {
    id: "present-simple",
    title: "Present Simple",
    from: 5,
    pattern: /present simple|hozirgi oddiy/,
    rule: "Odat va takroriy ishlar: I/you/we/they + V1; he/she/it + V-s. Savol va inkorda do/does ishlatiladi.",
    mistake:
      "Does dan keyin fe’lga -s qo‘shmang: Does she play? — Does she plays? emas.",
    items: [
      item(
        "She ___ tennis every Sunday.",
        "plays",
        ["play", "playing", "played"],
        "She bilan Present Simple fe’liga -s qo‘shiladi.",
      ),
      item(
        "___ you like apples?",
        "Do",
        ["Does", "Is", "Did"],
        "You bilan Present Simple savoli do bilan boshlanadi.",
      ),
      item(
        "He ___ live in London.",
        "does not",
        ["do not", "is not", "not"],
        "He bilan inkor: does not + V1.",
      ),
      item(
        "They ___ to school every day.",
        "go",
        ["goes", "going", "went"],
        "They bilan fe’lning asosiy shakli ishlatiladi.",
      ),
      item(
        "Choose the correct sentence.",
        "Does she play football?",
        [
          "Does she plays football?",
          "Do she plays football?",
          "Is she play football?",
        ],
        "Does + ega + V1: fe’lga -s qo‘shilmaydi.",
      ),
    ],
    pairs: [
      { left: "She plays.", right: "U o‘ynaydi." },
      { left: "Do you read?", right: "Siz o‘qiysizmi?" },
      { left: "They do not work.", right: "Ular ishlamaydi." },
    ],
  },
  {
    id: "to-be",
    title: "To be: am / is / are",
    from: 3,
    pattern: /to be|am.*is.*are|be verb/,
    rule: "I am; he/she/it is; you/we/they are. Savolda am/is/are egadan oldinga chiqadi.",
    mistake: "You bilan is emas, are ishlatiladi.",
    items: [
      item(
        "I ___ a teacher.",
        "am",
        ["is", "are", "be"],
        "I olmoshi bilan am ishlatiladi.",
      ),
      item(
        "She ___ my friend.",
        "is",
        ["am", "are", "be"],
        "She bilan is ishlatiladi.",
      ),
      item(
        "They ___ at school.",
        "are",
        ["is", "am", "be"],
        "They bilan are ishlatiladi.",
      ),
      item(
        "Choose the correct question.",
        "Are you ready?",
        ["Is you ready?", "You are ready?", "Am you ready?"],
        "Savolda are egadan oldin keladi.",
      ),
    ],
    pairs: [
      { left: "I", right: "am" },
      { left: "She", right: "is" },
      { left: "They", right: "are" },
    ],
  },
  {
    id: "present-continuous",
    title: "Present Continuous",
    from: 6,
    pattern: /present continuous|hozirgi davom/,
    rule: "Ayni paytda bo‘layotgan ish: am/is/are + V-ing. Now va at the moment kabi belgilar uchraydi.",
    mistake: "Yordamchi fe’lni tashlab ketmang: She is reading.",
    items: [
      item(
        "She is ___ a book now.",
        "reading",
        ["read", "reads", "readed"],
        "Is dan keyin V-ing shakli kerak.",
      ),
      item(
        "They ___ playing football now.",
        "are",
        ["is", "am", "be"],
        "They bilan are ishlatiladi.",
      ),
      item(
        "I ___ studying at the moment.",
        "am",
        ["is", "are", "do"],
        "I bilan am + V-ing ishlatiladi.",
      ),
      item(
        "Choose the correct sentence.",
        "He is running now.",
        ["He running now.", "He are running now.", "He is run now."],
        "He + is + running — to‘g‘ri tuzilma.",
      ),
    ],
    pairs: [
      { left: "She is reading.", right: "U hozir o‘qiyapti." },
      { left: "We are working.", right: "Biz hozir ishlayapmiz." },
      { left: "I am listening.", right: "Men hozir tinglayapman." },
    ],
  },
  {
    id: "past-simple",
    title: "Past Simple",
    from: 6,
    pattern: /past simple|o.tgan oddiy/,
    rule: "Tugagan o‘tgan ish: V2 yoki V-ed. Savol va inkorda did + V1 ishlatiladi.",
    mistake: "Did dan keyin V2 ishlatmang: Did he go? — Did he went? emas.",
    items: [
      item(
        "She ___ to school yesterday.",
        "went",
        ["go", "goes", "going"],
        "Go fe’lining o‘tgan zamon shakli went.",
      ),
      item(
        "We ___ football yesterday.",
        "played",
        ["play", "plays", "playing"],
        "Tugagan o‘tgan ish: play + ed.",
      ),
      item(
        "Did you ___ the film?",
        "watch",
        ["watched", "watches", "watching"],
        "Did dan keyin V1 kerak.",
      ),
      item(
        "He ___ at home yesterday.",
        "was",
        ["is", "are", "were"],
        "He uchun o‘tgan zamondagi to be — was.",
      ),
      item(
        "They ___ not visit us last week.",
        "did",
        ["do", "does", "are"],
        "Past Simple inkori did not + V1.",
      ),
    ],
    pairs: [
      { left: "go", right: "went" },
      { left: "see", right: "saw" },
      { left: "play", right: "played" },
    ],
  },
  {
    id: "future",
    title: "Future Simple: will",
    from: 7,
    pattern: /future|will|kelasi zamon/,
    rule: "Kelajak haqida taxmin yoki shu paytdagi qaror: will + V1. Inkor: will not / won’t.",
    mistake: "Will dan keyin -s, -ed yoki to qo‘shmang.",
    items: [
      item(
        "She will ___ tomorrow.",
        "come",
        ["comes", "came", "coming"],
        "Will dan keyin fe’lning asosiy shakli ishlatiladi.",
      ),
      item(
        "They ___ visit us next week.",
        "will",
        ["did", "does", "is"],
        "Next week — kelasi zamon belgisi.",
      ),
      item(
        "Choose the correct negative.",
        "I will not go.",
        ["I will not goes.", "I not will go.", "I will not went."],
        "Will not + V1 — to‘g‘ri tuzilma.",
      ),
      item(
        "Choose the correct question.",
        "Will you help me?",
        ["Will you helps me?", "Do you will help me?", "Will you helped me?"],
        "Savolda will egadan oldin keladi.",
      ),
    ],
    pairs: [
      { left: "tomorrow", right: "ertaga" },
      { left: "next week", right: "kelasi hafta" },
      { left: "will not", right: "won’t" },
    ],
  },
  {
    id: "articles",
    title: "Articles: a / an / the",
    from: 4,
    pattern: /article|artikl|a \/ an/,
    rule: "A — undosh tovushdan, an — unli tovushdan oldin. The aniq yoki oldin tilga olingan ot uchun ishlatiladi.",
    mistake: "Harfga emas, tovushga qarang: an hour, a university.",
    items: [
      item(
        "I have ___ apple.",
        "an",
        ["a", "the", "are"],
        "Apple unli tovush bilan boshlanadi; birinchi marta tilga olingan.",
      ),
      item(
        "She is ___ teacher.",
        "a",
        ["an", "the", "am"],
        "Teacher undosh tovush bilan boshlanadi; kasbni bildiradi.",
      ),
      item(
        "Close ___ door, please. (the specific door in this room)",
        "the",
        ["a", "an", "is"],
        "Xonadagi aniq eshik nazarda tutilmoqda.",
      ),
      item(
        "He studies at ___ university.",
        "a",
        ["an", "the", "are"],
        "University /juː/ undosh tovushi bilan boshlanadi.",
      ),
    ],
    pairs: [
      { left: "an apple", right: "unli tovush" },
      { left: "a book", right: "undosh tovush" },
      { left: "the specific book", right: "aniq ot" },
    ],
  },
  {
    id: "prepositions",
    title: "Prepositions: in / on / at",
    from: 5,
    pattern: /preposition|in.*on.*at|predlog/,
    rule: "Vaqt uchun: at 7 o’clock, on Monday, in May. Joy uchun: in a room, on a table, at a bus stop.",
    mistake: "Hafta kunlari bilan in emas, on ishlatiladi.",
    items: [
      item(
        "The lesson starts ___ 9 o’clock.",
        "at",
        ["in", "on", "to"],
        "Aniq soat oldidan at qo‘yiladi.",
      ),
      item(
        "We meet ___ Monday.",
        "on",
        ["in", "at", "to"],
        "Hafta kuni oldidan on ishlatiladi.",
      ),
      item(
        "My birthday is ___ May.",
        "in",
        ["on", "at", "to"],
        "Oy nomi oldidan in ishlatiladi.",
      ),
      item(
        "The book is ___ the table.",
        "on",
        ["in", "to", "from"],
        "Stolning ustki yuzasida — on the table.",
      ),
    ],
    pairs: [
      { left: "9 o’clock", right: "at" },
      { left: "Monday", right: "on" },
      { left: "May", right: "in" },
    ],
  },
  {
    id: "comparatives",
    title: "Comparative adjectives",
    from: 7,
    pattern: /comparative|taqqos|sifat/,
    rule: "Qisqa sifatga -er, uzun sifat oldiga more qo‘yiladi. Taqqoslashda than ishlatiladi. Good → better.",
    mistake: "More taller kabi ikki marta qiyos yasamang.",
    items: [
      item(
        "Ali is ___ than his brother. (tall)",
        "taller",
        ["more tall", "tallest", "tall"],
        "Tall qisqa sifat: taller than.",
      ),
      item(
        "This book is ___ than that one. (interesting)",
        "more interesting",
        ["interestinger", "most interesting", "interesting"],
        "Uzun sifat: more interesting than.",
      ),
      item(
        "Today is ___ than yesterday. (good)",
        "better",
        ["gooder", "best", "more good"],
        "Good sifatining qiyosiy shakli better.",
      ),
      item(
        "This bag is ___ than mine. (heavy)",
        "heavier",
        ["heavyer", "more heavy", "heaviest"],
        "Y harfi i ga almashadi: heavy → heavier.",
      ),
    ],
    pairs: [
      { left: "tall", right: "taller" },
      { left: "good", right: "better" },
      { left: "interesting", right: "more interesting" },
    ],
  },
  {
    id: "can",
    title: "Can / cannot: abilities",
    from: 5,
    pattern: /\bcan\b|cannot|ability|qobiliyat/,
    rule: "Qobiliyat: ega + can + V1. Inkor: cannot / can’t. Can dan keyin to ishlatilmaydi.",
    mistake: "He can swims emas, He can swim.",
    items: [
      item(
        "He can ___ very well.",
        "swim",
        ["swims", "swimming", "to swim"],
        "Can dan keyin V1 kerak.",
      ),
      item(
        "Choose the correct question.",
        "Can you speak English?",
        [
          "Do you can speak English?",
          "Can you speaks English?",
          "Can you to speak English?",
        ],
        "Can + ega + V1 — savol tuzilishi.",
      ),
      item(
        "Choose the correct negative.",
        "She cannot drive.",
        [
          "She does not can drive.",
          "She cannot drives.",
          "She cannot to drive.",
        ],
        "Cannot dan keyin asosiy fe’l ishlatiladi.",
      ),
      item(
        "Birds can ___.",
        "fly",
        ["flies", "flying", "to fly"],
        "Can dan keyin fly shakli kerak.",
      ),
    ],
    pairs: [
      { left: "can", right: "qila olmoq" },
      { left: "cannot", right: "qila olmaslik" },
      { left: "ability", right: "qobiliyat" },
    ],
  },
  {
    id: "vocabulary",
    title: "Daily routines vocabulary",
    from: 3,
    pattern: /vocabulary|daily|routine|lug.at|so.zlar/,
    rule: "Kundalik faoliyatni fe’l birikmalari bilan o‘rganing: wake up, have breakfast, go to school. Birikmani gapda ishlating.",
    mistake: "Have breakfast birikmasida odatda a artikli ishlatilmaydi.",
    items: [
      item(
        "“Wake up” means:",
        "uyg‘onmoq",
        ["uxlamoq", "yugurmoq", "yozmoq"],
        "Wake up — uyg‘onmoq.",
      ),
      item(
        "“Have breakfast” means:",
        "nonushta qilmoq",
        ["tushlik qilmoq", "suv ichmoq", "kiyinmoq"],
        "Have breakfast — nonushta qilmoq.",
      ),
      item(
        "“Go to school” means:",
        "maktabga bormoq",
        ["uyga qaytmoq", "kitob o‘qimoq", "dam olmoq"],
        "Go to school — maktabga bormoq.",
      ),
      item(
        "“Do homework” means:",
        "uy vazifasini bajarmoq",
        ["o‘yin o‘ynamoq", "uxlamoq", "ovqat pishirmoq"],
        "Do homework — uy vazifasini bajarmoq.",
      ),
    ],
    pairs: [
      { left: "wake up", right: "uyg‘onmoq" },
      { left: "have breakfast", right: "nonushta qilmoq" },
      { left: "do homework", right: "uy vazifasini bajarmoq" },
    ],
  },
];
export function resolveEnglishTopic(text: string) {
  const found = englishTopics.find((t) => t.pattern.test(text.toLowerCase()));
  return { topic: found || englishTopics[0], matched: !!found };
}
export const recommendedEnglishTopics = (grade: string) =>
  englishTopics.filter((t) => t.from <= Number(grade)).slice(0, 7);
const tasks = (topic: EnglishTopic, count: number, variant = 0) =>
  Array.from(
    { length: Math.min(50, Math.max(1, count)) },
    (_, n) => topic.items[(n + variant * 3) % topic.items.length],
  );
export function englishQuiz(i: AIInput): Question[] {
  const { topic, matched } = resolveEnglishTopic(i.topic);
  return tasks(topic, i.count || 7, i.variant).map((t, n) => {
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
    } else if (type === "Bir nechta javob") {
      q.text += "\nIkkita to‘g‘ri xulosani belgilang.";
      q.options = [
        `Javob: ${t.answer}`,
        `Javob: ${t.wrong[0]}`,
        `Izoh: ${t.explanation}`,
        `Javob: ${t.wrong[1]}`,
      ];
      q.correctAnswers = [0, 2];
    } else if (type === "To‘g‘ri / noto‘g‘ri") {
      const truth = n % 2 === 0;
      q.text += `\nTaklif qilingan javob: ${truth ? t.answer : t.wrong[0]}.`;
      q.options = ["To‘g‘ri", "Noto‘g‘ri"];
      q.correct = truth ? 0 : 1;
    } else if (type === "Moslashtirish") {
      q.text = "Iboralarni mos ma’no yoki shakl bilan birlashtiring.";
      q.pairs = topic.pairs;
    } else if (type === "Qisqa javob") {
      q.text += "\nJavobingizni qisqa izohlang.";
      q.answer = t.answer + "\n" + t.explanation;
      q.points = 2;
    } else if (type === "Ochiq savol") {
      q.text = `«${topic.title}» bo‘yicha 4 ta misol gap yozing. Bitta savol va bitta inkor gap kiriting.`;
      q.answer = `Mezon: grammatika (2), mavzuga moslik (1), savol/inkor tuzilishi (2).\nQoida: ${topic.rule}`;
      q.points = 5;
    }
    return q;
  });
}
export function englishDocument(i: AIInput, kind: "conspect" | "homework") {
  const { topic, matched } = resolveEnglishTopic(i.topic);
  const list = tasks(topic, i.count || 5);
  const intro = `Ingliz tili · ${i.grade}-sinf\nMavzu: ${i.topic}${matched ? "" : `\nMaxsus shablon topilmadi; ${topic.title} namunasi berildi.`}`;
  return kind === "conspect"
    ? {
        content:
          intro +
          `\n\nKirish\n${topic.title} mavzusini misol gaplar orqali o‘rganamiz.\n\nAsosiy qoida\n${topic.rule}\n\nNamuna va izoh\n${list[0].prompt}\nJavob: ${list[0].answer}\n${list[0].explanation}\n\nLug‘at va birikmalar\n${topic.pairs.map((p) => p.left + " → " + p.right).join("\n")}\n\nAmaliy mashqlar\n${list
            .slice(0, i.level === "Qisqa" ? 2 : 4)
            .map((t, n) => `${n + 1}. ${t.prompt}`)
            .join(
              "\n",
            )}\n\nKo‘p uchraydigan xato\n${topic.mistake}\n\nXulosa\n${topic.rule}\n\nTakrorlash savollari\n1. Qoidani o‘z so‘zingiz bilan ayting.\n2. Bir misol gap tuzing.\n3. Xatoni qanday tekshirasiz?`,
        answerKey: "",
      }
    : {
        content:
          intro +
          `\nQiyinlik: ${i.level || "O‘rta"}\n\nKo‘rsatma\nTo‘g‘ri shakl yoki ma’noni yozing. Javobingizni qoida bilan asoslang.\n\nMashqlar\n${list.map((t, n) => `${n + 1}. ${t.prompt}`).join("\n")}`,
        answerKey: list
          .map((t, n) => `${n + 1}. ${t.answer}\n${t.explanation}`)
          .join("\n\n"),
      };
}
export function englishLesson(i: AIInput): LessonSection[] {
  const { topic } = resolveEnglishTopic(i.topic);
  const list = tasks(topic, 4);
  const minutes = [0.1, 0.3, 0.25, 0.15, 0.1].map((x) =>
    Math.floor(i.duration * x),
  );
  return [
    {
      title: "Dars maqsadi",
      minutes: 0,
      content: `${topic.title} qoidasini tushunish, gap tuzish va savol/inkor shakllarini amalda qo‘llash.\n${i.grade}-sinf · ${i.language || "O‘zbek"} · ${i.style || "Interaktiv"}`,
    },
    {
      title: "Kerakli materiallar",
      minutes: 0,
      content:
        "Doskada namuna gaplar, so‘z kartochkalari va juftlikda bajarish uchun topshiriqlar.",
    },
    {
      title: "Kirish",
      minutes: minutes[0],
      content: `Mavzu bo‘yicha 3 ta savol bering. Misol: ${list[0].prompt}`,
    },
    {
      title: "Mavzuni tushuntirish",
      minutes: minutes[1],
      content:
        topic.rule +
        "\n\n" +
        list[0].prompt +
        "\nJavob: " +
        list[0].answer +
        "\n" +
        list[0].explanation,
    },
    {
      title: "Mashqlar",
      minutes: minutes[2],
      content: list.map((t, n) => `${n + 1}. ${t.prompt}`).join("\n"),
    },
    {
      title: "Juftlikda muloqot",
      minutes: minutes[3],
      content: `${topic.title} dan foydalanib 4 replikali suhbat tuzing. Sherikning grammatik shakllarini tekshiring.`,
    },
    {
      title: "Baholash",
      minutes: minutes[4],
      content: `Bitta misol gap, bitta savol va bitta inkor gap tuzing. Xatoni muhokama qiling: ${topic.mistake}`,
    },
    {
      title: "Uy vazifasi",
      minutes: 0,
      content: `${topic.title} bo‘yicha 5 ta gap yozing. Kamida bitta savol va bitta inkor gap kiriting.`,
    },
    {
      title: "Xulosa",
      minutes: i.duration - minutes.reduce((s, n) => s + n, 0),
      content:
        topic.rule +
        "\nO‘qituvchi uchun javoblar: " +
        list.map((t, n) => `${n + 1}) ${t.answer}`).join("; "),
    },
  ];
}
