import { verifyMathTask } from "./verification";
export const mathSubjects = ["Matematika", "Algebra", "Geometriya"];
export const isMathSubject = (s?: string) =>
  mathSubjects.some((x) => x.toLowerCase() === (s || "").trim().toLowerCase());
export interface MathTask {
  prompt: string;
  answer: string;
  steps: string[];
  wrong: string[];
}
export interface MathTopic {
  id: string;
  title: string;
  subject: string;
  from: number;
  rule: string;
  concepts: string;
  mistake: string;
  pattern: RegExp;
  make: (n: number) => MathTask;
}
const task = (
  prompt: string,
  answer: string | number,
  steps: string[],
  wrong?: string[],
): MathTask => ({
  prompt,
  answer: String(answer),
  steps,
  wrong: wrong || [
    String(Number(answer) + 1),
    String(Number(answer) - 1),
    String(Number(answer) + 3),
  ],
});
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
export const fraction = (a: number, b: number) => {
  const g = gcd(a, b);
  return b / g === 1 ? String(a / g) : `${a / g}/${b / g}`;
};
export const mathTopics: MathTopic[] = [
  {
    id: "arithmetic",
    title: "Natural sonlar ustida amallar",
    subject: "Matematika",
    from: 3,
    pattern:
      /natural|arifmetik|ko.paytir|hisobla|qo.shish|ayirish|bo.lish|sonlar/,
    rule: "Avval qavs ichidagi, keyin ko‘paytirish va bo‘lish, so‘ng qo‘shish va ayirish amallari bajariladi.",
    concepts: "Yig‘indi, ayirma, ko‘paytma, bo‘linma; amallar tartibi.",
    mistake:
      "Qo‘shishni ko‘paytirishdan oldin bajarish. Amallar tartibini alohida belgilang.",
    make: (n) => {
      const a = n + 3,
        b = (n % 7) + 2,
        c = (n % 5) + 1;
      return task(`${a} + ${b} × ${c} ifodani hisoblang.`, a + b * c, [
        `${b} × ${c} = ${b * c}`,
        `${a} + ${b * c} = ${a + b * c}`,
      ]);
    },
  },
  {
    id: "fractions",
    title: "Oddiy kasrlarni qo‘shish",
    subject: "Matematika",
    from: 5,
    pattern: /kasr/,
    rule: "Maxrajlar bir xil bo‘lsa, suratlar qo‘shiladi, maxraj o‘zgarmaydi: a/c + b/c = (a+b)/c. Natija imkon qadar qisqartiriladi.",
    concepts: "Surat, maxraj, umumiy maxraj, qisqartirish.",
    mistake:
      "Maxrajlarni ham qo‘shish. Maxraj teng bo‘lganda faqat suratlar qo‘shiladi.",
    make: (n) => {
      const d = n + 5,
        a = (n % 3) + 1,
        b = (n % 2) + 1;
      return task(
        `${a}/${d} + ${b}/${d} yig‘indini toping va qisqartiring.`,
        fraction(a + b, d),
        [
          `${a}/${d} + ${b}/${d} = ${a + b}/${d}`,
          `Qisqartirilgan javob: ${fraction(a + b, d)}`,
        ],
        [
          fraction(a + b + 1, d),
          fraction(a + b, d + 1),
          fraction(a + b + 2, d),
        ],
      );
    },
  },
  {
    id: "percent",
    title: "Sonning foizini topish",
    subject: "Matematika",
    from: 6,
    pattern: /foiz|protsent/,
    rule: "A sonning p foizi A × p / 100 ga teng. Masalan, 10% = 10/100.",
    concepts: "Foiz, butun, qism, 100 ga nisbatan ulush.",
    mistake:
      "Foiz sonini 100 ga bo‘lishni unutish. p% ni avval p/100 shaklida yozing.",
    make: (n) => {
      const a = (n + 4) * 100,
        p = ((n % 5) + 1) * 5;
      return task(`${a} sonning ${p}% ini toping.`, (a * p) / 100, [
        `${p}% = ${p}/100`,
        `${a} × ${p}/100 = ${(a * p) / 100}`,
      ]);
    },
  },
  {
    id: "ratio",
    title: "Nisbat va proporsiya",
    subject: "Matematika",
    from: 6,
    pattern: /nisbat|propors/,
    rule: "a/b = c/d proporsiyada b va d nol bo‘lmasa, a × d = b × c.",
    concepts: "Nisbat, proporsiya, chetki va o‘rta hadlar.",
    mistake:
      "Ko‘paytmalarni noto‘g‘ri tuzish. Chetki hadlar ko‘paytmasini o‘rta hadlar bilan tenglashtiring.",
    make: (n) => {
      const a = n + 2,
        b = (n % 5) + 2,
        k = (n % 3) + 2;
      return task(`x/${b} = ${a * k}/${b * k} proporsiyani yeching.`, a, [
        `x × ${b * k} = ${b} × ${a * k}`,
        `x = ${b * a * k}/${b * k} = ${a}`,
      ]);
    },
  },
  {
    id: "linear",
    title: "Chiziqli tenglamalar",
    subject: "Algebra",
    from: 7,
    pattern: /chiziqli teng|tenglama/,
    rule: "ax + b = c tenglamada a ≠ 0 bo‘lsa, x = (c − b)/a. Tenglikning ikki tomoniga bir xil amal qo‘llanadi.",
    concepts:
      "Noma’lum, koeffitsiyent, tenglama ildizi, teng kuchli almashtirish.",
    mistake:
      "Hadni ko‘chirganda ishorani o‘zgartirmaslik. Har bir bosqichni tenglikning ikki tomonida bajaring.",
    make: (n) => {
      const a = (n % 5) + 2,
        b = (n % 7) + 1,
        x = n + 2,
        c = a * x + b;
      return task(`${a}x + ${b} = ${c} tenglamani yeching.`, x, [
        `${a}x = ${c} − ${b} = ${a * x}`,
        `x = ${a * x}/${a} = ${x}`,
        `Tekshirish: ${a} × ${x} + ${b} = ${c}`,
      ]);
    },
  },
  {
    id: "quadratic",
    title: "Kvadrat tenglamalar",
    subject: "Algebra",
    from: 8,
    pattern: /kvadrat teng|diskriminant/,
    rule: "ax² + bx + c = 0 (a ≠ 0). D = b² − 4ac; D ≥ 0 bo‘lsa, x = (−b ± √D)/(2a).",
    concepts: "Kvadrat tenglama, diskriminant, ildiz, Viyet teoremasi.",
    mistake: "Formuladagi −b ishorasini yoki 2a maxrajni unutish.",
    make: (n) => {
      const a = n + 1,
        b = n + 3,
        s = a + b,
        p = a * b;
      return task(
        `x² − ${s}x + ${p} = 0 tenglamaning ildizlarini toping.`,
        `${a}; ${b}`,
        [
          `(x − ${a})(x − ${b}) = 0`,
          `x₁ = ${a}, x₂ = ${b}`,
          `Tekshirish: ${a} + ${b} = ${s}; ${a} × ${b} = ${p}`,
        ],
        [`${a + 1}; ${b + 1}`, `${-a}; ${-b}`, `${a}; ${b + 1}`],
      );
    },
  },
  {
    id: "powers",
    title: "Daraja va uning xossalari",
    subject: "Algebra",
    from: 7,
    pattern: /daraja|ildiz|ko.rsatkich/,
    rule: "Bir xil asosli darajalar ko‘paytirilganda ko‘rsatkichlar qo‘shiladi: aᵐ × aⁿ = aᵐ⁺ⁿ.",
    concepts: "Asos, daraja ko‘rsatkichi, darajalarni ko‘paytirish.",
    mistake: "Ko‘rsatkichlarni qo‘shish o‘rniga ko‘paytirish.",
    make: (n) => {
      const a = (n % 4) + 2,
        m = (n % 2) + 1,
        k = 2;
      return task(`${a}^${m} × ${a}^${k} ni hisoblang.`, a ** (m + k), [
        `${a}^${m} × ${a}^${k} = ${a}^${m + k}`,
        `${a}^${m + k} = ${a ** (m + k)}`,
      ]);
    },
  },
  {
    id: "rectangle",
    title: "To‘g‘ri to‘rtburchak yuzi va perimetri",
    subject: "Geometriya",
    from: 5,
    pattern: /to.rtburchak|perimetr|yuza|yuzini/,
    rule: "Tomonlari a va b bo‘lgan to‘g‘ri to‘rtburchakning yuzi S = a × b, perimetri P = 2(a+b).",
    concepts: "Uzunlik, kenglik, perimetr, yuza; cm va cm².",
    mistake:
      "Yuza va perimetr formulalarini aralashtirish. Yuzaning birligi kvadrat birlikdir.",
    make: (n) => {
      const a = n + 4,
        b = (n % 6) + 2,
        s = a * b;
      return task(
        `Tomonlari ${a} cm va ${b} cm bo‘lgan to‘g‘ri to‘rtburchakning yuzini toping.`,
        `${s} cm²`,
        [`S = a × b`, `S = ${a} × ${b} = ${s} cm²`],
        [`${s + 1} cm²`, `${s + 2} cm²`, `${s + 3} cm²`],
      );
    },
  },
  {
    id: "triangle",
    title: "Uchburchak burchaklari",
    subject: "Geometriya",
    from: 7,
    pattern: /uchburchak|burchak/,
    rule: "Yevklid geometriyasida uchburchak ichki burchaklarining yig‘indisi 180°: α + β + γ = 180°.",
    concepts: "Ichki burchak, burchaklar yig‘indisi, uchburchak.",
    mistake: "Uchburchak ichki burchaklari yig‘indisini 360° deb olish.",
    make: (n) => {
      const a = 30 + (n % 5) * 5,
        b = 40 + (Math.floor(n / 5) % 5) * 5,
        c = 180 - a - b;
      return task(
        `Uchburchakning ikki burchagi ${a}° va ${b}°. Uchinchi burchakni toping.`,
        `${c}°`,
        [`γ = 180° − ${a}° − ${b}°`, `γ = ${c}°`],
        [`${c + 5}°`, `${c - 5}°`, `${c + 10}°`],
      );
    },
  },
  {
    id: "pythagoras",
    title: "Pifagor teoremasi",
    subject: "Geometriya",
    from: 8,
    pattern: /pifagor|gipotenuza|katet/,
    rule: "To‘g‘ri burchakli uchburchakda katetlar kvadratlari yig‘indisi gipotenuza kvadratiga teng: a² + b² = c².",
    concepts: "Katet, gipotenuza, to‘g‘ri burchak, kvadrat ildiz.",
    mistake:
      "Gipotenuzani katet deb olish yoki kvadrat ildiz chiqarishni unutish.",
    make: (n) => {
      const k = n + 1;
      return task(
        `Katetlari ${3 * k} cm va ${4 * k} cm bo‘lgan to‘g‘ri burchakli uchburchakning gipotenuzasini toping.`,
        `${5 * k} cm`,
        [
          `c² = ${3 * k}² + ${4 * k}² = ${25 * k * k}`,
          `c = √${25 * k * k} = ${5 * k} cm`,
        ],
        [`${5 * k + 1} cm`, `${5 * k + 2} cm`, `${5 * k + 3} cm`],
      );
    },
  },
  {
    id: "function",
    title: "Chiziqli funksiya",
    subject: "Algebra",
    from: 7,
    pattern: /funksiya|grafik/,
    rule: "y = kx + b — chiziqli funksiya. x qiymatini qo‘yib y hisoblanadi; k qiyalikni, b esa ordinata o‘qi bilan kesishishni bildiradi.",
    concepts: "Argument, funksiya qiymati, koordinata, qiyalik.",
    mistake:
      "x qiymatini faqat hadning bir qismiga qo‘yish yoki ishorani yo‘qotish.",
    make: (n) => {
      const k = (n % 4) + 2,
        b = (n % 5) + 1,
        x = n + 1;
      return task(
        `y = ${k}x + ${b} funksiyada x = ${x} bo‘lsa, y ni toping.`,
        k * x + b,
        [`y = ${k} × ${x} + ${b}`, `y = ${k * x + b}`],
      );
    },
  },
  {
    id: "trig",
    title: "Trigonometrik nisbatlar",
    subject: "Geometriya",
    from: 9,
    pattern: /trig|sinus|kosinus|sin\s|cos\s|tangens/,
    rule: "To‘g‘ri burchakli uchburchakda sin α = qarshi katet/gipotenuza, cos α = yondosh katet/gipotenuza.",
    concepts: "Sinus, kosinus, o‘tkir burchak; asosiy burchaklar qiymatlari.",
    mistake:
      "Gradus va radianni aralashtirish yoki qarshi va yondosh katetlarni almashtirish.",
    make: (n) => {
      const samples = [
        ["sin 0°", "0"],
        ["sin 30°", "1/2"],
        ["sin 45°", "√2/2"],
        ["sin 60°", "√3/2"],
        ["sin 90°", "1"],
        ["cos 60°", "1/2"],
      ];
      const [expr, a] = samples[n % samples.length];
      return task(
        `${expr} qiymatini toping.`,
        a,
        [
          `Asosiy burchaklarning trigonometrik qiymatlaridan foydalanamiz.`,
          `${expr} = ${a}`,
        ],
        a === "0"
          ? ["1", "1/2", "−1"]
          : [`−(${a})`, `(${a}) + 1`, `(${a}) + 2`],
      );
    },
  },
  {
    id: "probability",
    title: "Ehtimollik",
    subject: "Matematika",
    from: 9,
    pattern: /ehtimol|statistik|tasodif/,
    rule: "Teng imkoniyatli natijalarda hodisa ehtimoli P = m/n, bu yerda m qulay, n esa barcha natijalar soni.",
    concepts: "Hodisa, qulay natija, barcha natijalar, ehtimol 0 dan 1 gacha.",
    mistake: "Qulay natijalar sonini barcha natijalar soniga teskari bo‘lish.",
    make: (n) => {
      const red = n + 2,
        total = red + 5;
      return task(
        `Qutida ${red} ta qizil va 5 ta ko‘k shar bor. Tasodifan olingan sharning qizil bo‘lish ehtimolini toping.`,
        fraction(red, total),
        [
          `Jami: ${red} + 5 = ${total} ta shar`,
          `P = ${red}/${total} = ${fraction(red, total)}`,
        ],
        [
          fraction(red + 1, total),
          fraction(red, total + 1),
          fraction(red + 2, total),
        ],
      );
    },
  },
  {
    id: "derivative",
    title: "Darajali funksiyaning hosilasi",
    subject: "Algebra",
    from: 11,
    pattern: /hosila|derivativ/,
    rule: "Darajali funksiya uchun (xⁿ)′ = n·xⁿ⁻¹; o‘zgarmas ko‘paytuvchi hosila tashqarisida qoladi.",
    concepts: "Funksiya, hosila, o‘zgarish tezligi, daraja qoidasi.",
    mistake:
      "Darajani bittaga kamaytirishni yoki avvalgi darajaga ko‘paytirishni unutish.",
    make: (n) => {
      const a = n + 2,
        p = (n % 3) + 2;
      const ans = `${a * p}x^${p - 1}`;
      return task(
        `f(x) = ${a}x^${p} funksiyaning hosilasini toping.`,
        ans,
        [`f′(x) = ${a} × ${p} × x^(${p}−1)`, `f′(x) = ${ans}`],
        [`${a * p + 1}x^${p - 1}`, `${a * p}x^${p}`, `${a}x^${p - 1}`],
      );
    },
  },
];
mathTopics.push(
  {
    id: "multiply",
    title: "Natural sonlarni ko‘paytirish",
    subject: "Matematika",
    from: 2,
    pattern: /ko.paytir/,
    rule: "a × b — a sonini b marta qo‘shish. a × b = b × a.",
    concepts: "Ko‘paytuvchi, ko‘paytma, ko‘paytirish jadvali.",
    mistake: "Ko‘paytirishni qo‘shish bilan almashtirish.",
    make: (n) => {
      const a = n + 2,
        b = (n % 8) + 2;
      return task(`${a} × ${b} ni hisoblang.`, a * b, [
        `${a} × ${b} = ${a * b}`,
        `Tekshirish: ${a * b} ÷ ${b} = ${a}`,
      ]);
    },
  },
  {
    id: "fraction-subtract",
    title: "Oddiy kasrlarni ayirish",
    subject: "Matematika",
    from: 5,
    pattern: /kasr.*ayir|ayir.*kasr/,
    rule: "Maxrajlari bir xil kasrlarda suratlar ayiriladi: a/c − b/c = (a−b)/c.",
    concepts: "Surat, maxraj, qisqartirish.",
    mistake: "Maxrajlarni ayirish. Maxraj o‘zgarmaydi.",
    make: (n) => {
      const d = n + 8,
        a = (n % 3) + 4,
        b = 2;
      return task(
        `${a}/${d} − ${b}/${d} ni hisoblang.`,
        fraction(a - b, d),
        [
          `${a}/${d} − ${b}/${d} = ${a - b}/${d}`,
          `Javob: ${fraction(a - b, d)}`,
        ],
        [fraction(a - b + 1, d), fraction(a - b, d + 1), fraction(a + b, d)],
      );
    },
  },
  {
    id: "fraction-multiply",
    title: "Oddiy kasrlarni ko‘paytirish",
    subject: "Matematika",
    from: 6,
    pattern: /kasr.*ko.paytir|ko.paytir.*kasr/,
    rule: "a/b × c/d = (a×c)/(b×d). Suratlar va maxrajlar o‘zaro ko‘paytiriladi; natija qisqartiriladi.",
    concepts: "Kasrlar ko‘paytmasi, qisqartirish.",
    mistake: "Surat va maxrajni noto‘g‘ri kesishma bo‘yicha ko‘paytirish.",
    make: (n) => {
      const a = (n % 4) + 1,
        b = n + 5,
        d = (n % 5) + 3;
      return task(
        `${a}/${b} × 2/${d} ni hisoblang.`,
        fraction(a * 2, b * d),
        [
          `${a}/${b} × 2/${d} = ${a * 2}/${b * d}`,
          `Javob: ${fraction(a * 2, b * d)}`,
        ],
        [
          fraction(a * 2 + 1, b * d),
          fraction(a * 2, b * d + 1),
          fraction(a * 2 + 2, b * d),
        ],
      );
    },
  },
);
// Specific topics precede broad matches such as “tenglama” and “uchburchak”.
const priority = [
  "fraction-subtract",
  "fraction-multiply",
  "quadratic",
  "pythagoras",
  "derivative",
  "trig",
  "fractions",
  "percent",
  "ratio",
  "powers",
  "function",
  "probability",
  "rectangle",
  "triangle",
  "linear",
  "multiply",
  "arithmetic",
];
export function resolveMathTopic(text: string, subject = "Matematika") {
  const lower = text.toLowerCase();
  const found = priority
    .map((id) => mathTopics.find((t) => t.id === id)!)
    .find((t) => t.pattern.test(lower));
  return {
    topic:
      found ||
      mathTopics.find(
        (t) =>
          t.id ===
          (subject === "Geometriya"
            ? "rectangle"
            : subject === "Algebra"
              ? "linear"
              : "arithmetic"),
      )!,
    matched: !!found,
  };
}
export function recommendedTopics(grade: string, subject: string) {
  const g = Number(grade) || 8;
  return mathTopics
    .filter(
      (t) => t.from <= g && (subject === "Matematika" || t.subject === subject),
    )
    .sort((a, b) => Math.abs(g - a.from) - Math.abs(g - b.from))
    .slice(0, 7);
}
export function makeMathTasks(
  topic: MathTopic,
  count: number,
  level = "O‘rta",
  variant = 0,
  grade = "8",
) {
  const start = Number(grade) >= 8 ? 2 : 0;
  const seen = new Set<string>();
  const result: MathTask[] = [];
  for (
    let n = 0;
    result.length < Math.max(1, Math.min(50, count)) && n < 2000;
    n++
  ) {
    const difficulty =
      level === "Aralash"
        ? ["Oson", "O‘rta", "Murakkab"][result.length % 3]
        : level;
    const hard = ["Murakkab", "Qiyin", "Yuqori"].includes(difficulty);
    const easy = ["Oson", "Boshlang‘ich"].includes(difficulty);
    const k = start + n * 4 + (((variant % 4) + 4) % 4);
    let t = topic.make(k);
    // Difficulty changes the method required, as well as numeric parameters.
    if (topic.id === "linear" && !easy) {
      const x = k + 2,
        a = (k % 5) + 4,
        b = (k % 7) + 1,
        c = a - 2;
      if (hard) {
        const r = (a - c) * x + a * b;
        t = task(`${a}(x + ${b}) − ${c}x = ${r} tenglamani yeching.`, x, [
          `${a}x + ${a * b} − ${c}x = ${r}`,
          `${a - c}x = ${r} − ${a * b} = ${(a - c) * x}`,
          `x = ${(a - c) * x}/${a - c} = ${x}`,
          `Tekshirish: ${a} × (${x} + ${b}) − ${c} × ${x} = ${r}`,
        ]);
      } else {
        const d = (a - c) * x + b;
        t = task(`${a}x + ${b} = ${c}x + ${d} tenglamani yeching.`, x, [
          `${a}x − ${c}x = ${d} − ${b}`,
          `${a - c}x = ${(a - c) * x}`,
          `x = ${x}`,
          `Tekshirish: ${a} × ${x} + ${b} = ${c} × ${x} + ${d} = ${a * x + b}`,
        ]);
      }
    }
    if (["fractions", "fraction-subtract"].includes(topic.id) && !easy) {
      const d = k + 5,
        a = 2,
        b = 1,
        factor = hard ? 3 : 2;
      const subtract = topic.id === "fraction-subtract";
      const numerator = a * factor + (subtract ? -b : b);
      const denominator = d * factor,
        sign = subtract ? "−" : "+";
      t = task(
        `${a}/${d} ${sign} ${b}/${denominator} ni hisoblang va qisqartiring.`,
        fraction(numerator, denominator),
        [
          `Umumiy maxraj: ${denominator}`,
          `${a}/${d} = ${a * factor}/${denominator}`,
          `${a * factor}/${denominator} ${sign} ${b}/${denominator} = ${numerator}/${denominator}`,
          `Javob: ${fraction(numerator, denominator)}`,
        ],
        [
          fraction(numerator + 1, denominator),
          fraction(numerator, denominator + 1),
          fraction(numerator + 2, denominator),
        ],
      );
    }
    if (topic.id === "powers") {
      const a = k + 2,
        m = easy ? 1 : 2,
        p = hard ? 3 : 2;
      t = task(
        `${a}^${m} × ${a}^${p} ni bitta daraja shaklida yozing.`,
        `${a}^${m + p}`,
        [`${a}^${m} × ${a}^${p} = ${a}^(${m}+${p})`, `Javob: ${a}^${m + p}`],
        [`${a}^${m + p + 1}`, `${a}^${m + p - 1}`, `${a + 1}^${m + p}`],
      );
    }
    if (topic.id === "triangle") {
      const a = 20 + (k % 60),
        b = 20 + (Math.floor(k / 60) % 60),
        c = 180 - a - b;
      t = task(
        `Uchburchakning ikki burchagi ${a}° va ${b}°. Uchinchi burchakni toping.`,
        `${c}°`,
        [`γ = 180° − ${a}° − ${b}°`, `γ = ${c}°`],
        [`${c + 1}°`, `${c - 1}°`, `${c + 2}°`],
      );
    }
    if (topic.id === "trig") {
      const scale = Math.floor(k / 8) + 1,
        m = (k % 8) + 2;
      const a = (m * m - 1) * scale,
        b = 2 * m * scale,
        c = (m * m + 1) * scale;
      const ratio = hard ? "cos" : "sin",
        num = hard ? b : a;
      t = task(
        `To‘g‘ri burchakli uchburchakda α ga qarshi katet ${a} cm, yondosh katet ${b} cm, gipotenuza ${c} cm. ${ratio} α ni toping.`,
        fraction(num, c),
        [
          `${ratio} α = ${hard ? "yondosh" : "qarshi"} katet / gipotenuza`,
          `${ratio} α = ${num}/${c} = ${fraction(num, c)}`,
        ],
        [fraction(num + 1, c), fraction(num, c + 1), fraction(num + 2, c)],
      );
    }
    if (!seen.has(t.prompt)) {
      seen.add(t.prompt);
      result.push(t);
    }
  }
  if (result.length < Math.min(50, count))
    throw new Error(
      "Bu mavzuda yetarli takrorlanmaydigan misol topilmadi. Sonni kamaytiring.",
    );
  if (result.some((t) => !verifyMathTask(topic.id, t)))
    throw new Error(
      "Misol yoki yechim tekshiruvdan o‘tmadi. Qayta urinib ko‘ring.",
    );
  return result;
}
export function mathLessonSections(
  topicText: string,
  duration = 45,
  subject = "Matematika",
  grade = "8",
  level = "O‘rta",
  style = "Interaktiv",
  count = 5,
) {
  const { topic, matched } = resolveMathTopic(topicText, subject);
  const tasks = makeMathTasks(topic, Math.max(count + 3, 6), level, 0, grade);
  const allocations = [0.12, 0.3, 0.23, 0.15, 0.1].map((x) =>
    Math.floor(duration * x),
  );
  return [
    {
      title: "Dars maqsadi",
      minutes: 0,
      content: `«${topic.title}» qoidasini izohlash, kamida 3 ta misolni yechish va javobni tekshirish.\n${matched ? "" : "Bu erkin mavzu uchun maxsus shablon topilmadi; tanlangan matematik yo‘nalish bo‘yicha namuna berildi.\n"}${subject} · ${grade}-sinf · Uslub: ${style}.`,
    },
    {
      title: "Kerakli jihozlar",
      minutes: 0,
      content:
        "Katakli daftar, doska, marker, chizg‘ich va mavzuga oid tarqatma kartochkalar. Geometriya uchun transportir va sirkul.",
    },
    {
      title: "Kirish",
      minutes: allocations[0],
      content: `Avvalgi bilimni faollashtiring: ${topic.concepts}\nQisqa boshlang‘ich savol: ${tasks[0].prompt}`,
    },
    {
      title: "Yangi mavzu",
      minutes: allocations[1],
      content: `Asosiy qoida: ${topic.rule}\n\nDoska uchun misol: ${tasks[0].prompt}\n${tasks[0].steps.join("\n")}\nJavob: ${tasks[0].answer}`,
    },
    {
      title: "Amaliy mashqlar",
      minutes: allocations[2],
      content: tasks
        .slice(1, count + 1)
        .map((t, n) => `${n + 1}. ${t.prompt}`)
        .join("\n"),
    },
    {
      title: "Guruhli faoliyat",
      minutes: allocations[3],
      content: `${style === "Guruhli" ? "Guruhlar" : "Juftliklar"} bir misolni yechadi, ikkinchi guruh yechimni tekshiradi.\n${tasks[4].prompt}\nKeng tarqalgan xatoni muhokama qiling: ${topic.mistake}`,
    },
    {
      title: "Baholash savollari",
      minutes: allocations[4],
      content: `1. Asosiy formulani yozing va belgilarni izohlang.\n2. ${tasks[5].prompt}\n3. Javobni qanday tekshirdingiz?\nMezon: usul (1), hisob (1), izoh va tekshirish (1).`,
    },
    {
      title: "Uy vazifasi",
      minutes: 0,
      content: makeMathTasks(topic, 3, level, 1, grade)
        .map((t, n) => `${n + 1}. ${t.prompt}`)
        .join("\n"),
    },
    {
      title: "Xulosa",
      minutes: duration - allocations.reduce((s, n) => s + n, 0),
      content: `Asosiy fikr: ${topic.rule}\nO‘qituvchi uchun mashq javoblari: ${tasks
        .slice(1, count + 1)
        .map((t, n) => `${n + 1}) ${t.answer}`)
        .join(
          "; ",
        )}.\nChiqish chiptasi: bir to‘g‘ri yechim va bir xatoni tuzatish.`,
    },
  ];
}
