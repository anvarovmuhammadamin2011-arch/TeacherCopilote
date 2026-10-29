import { z } from "zod";
import { uid } from "@/utils/cn";
import type { RegistrationDraft, RegistrationClass } from "@/types";
export const teachingSubjects = ["Matematika", "Ingliz tili"];
export const regions = [
  "Andijon",
  "Buxoro",
  "Farg‘ona",
  "Jizzax",
  "Namangan",
  "Navoiy",
  "Qashqadaryo",
  "Qoraqalpog‘iston Respublikasi",
  "Samarqand",
  "Sirdaryo",
  "Surxondaryo",
  "Toshkent viloyati",
  "Toshkent shahri",
  "Xorazm",
];
export const schoolTypes = [
  "Davlat maktabi",
  "Xususiy maktab",
  "O‘quv markazi",
  "Boshqa",
];
export const experienceOptions = [
  "0–1 yil",
  "1–3 yil",
  "3–5 yil",
  "5–10 yil",
  "10+ yil",
];
export const educationOptions = [
  "O‘rta maxsus",
  "Bakalavr",
  "Magistr",
  "Boshqa",
];
export const languageOptions = ["O‘zbek", "Rus", "Ingliz"];
const required = z.string().trim().min(1, "Bu maydonni to‘ldirish majburiy.");
export const personalSchema = z
  .object({
    firstName: required,
    lastName: required,
    middleName: z.string(),
    email: z.email("To‘g‘ri elektron pochta manzilini kiriting."),
    phone: z
      .string()
      .refine(
        (v) => !v || /^[+\d\s()-]{7,20}$/.test(v),
        "Telefon raqamini tekshiring.",
      ),
    avatar: z.string(),
    password: z.string().min(8, "Parol kamida 8 ta belgidan iborat bo‘lsin."),
    confirmation: z.string(),
  })
  .refine((v) => v.password === v.confirmation, {
    path: ["confirmation"],
    message: "Parollar bir xil bo‘lishi kerak.",
  });
export const professionalSchema = z.object({
  school: z.object({
    name: required,
    type: required,
    region: required,
    district: required,
  }),
  primarySubject: z.enum(["Matematika", "Ingliz tili"]),
  additionalSubjects: z.array(z.enum(["Matematika", "Ingliz tili"])),
  experienceRange: required,
  education: required,
  languages: z.array(z.string()).min(1, "Kamida bitta dars tilini tanlang."),
});
export const classSchema = z.object({
  id: z.string(),
  name: required,
  grade: z.number().int().min(1).max(11),
  section: required,
  subject: z.enum(["Matematika", "Ingliz tili"]),
  year: z
    .string()
    .regex(/^\d{4}[–-]\d{4}$/, "Masalan, 2026–2027 shaklida yozing.")
    .refine(
      (s) => Number(s.slice(5)) === Number(s.slice(0, 4)) + 1,
      "O‘quv yili ketma-ket ikki yil bo‘lsin.",
    ),
  weeklyHours: z.number().min(1).max(40),
});
export const classesSchema = z
  .array(classSchema)
  .max(30, "Ko‘pi bilan 30 ta fan biriktiring.")
  .superRefine((rows, ctx) => {
    const keys = new Set<string>();
    rows.forEach((r, i) => {
      const key = [
        r.name.trim().toLowerCase(),
        r.year,
        r.subject.trim().toLowerCase(),
      ].join("|");
      if (keys.has(key))
        ctx.addIssue({
          code: "custom",
          path: [i, "subject"],
          message: "Bu sinfga shu fan allaqachon biriktirilgan.",
        });
      keys.add(key);
    });
  });
export const employmentSchema = z.object({
  type: required,
  weeklyHours: z.number().min(0).max(80),
  workSchedule: z.string(),
  startDate: z.string(),
  currency: z.literal("UZS"),
});
export const newClass = (subject = "Matematika"): RegistrationClass => ({
  id: uid(),
  name: "",
  grade: 8,
  section: "A",
  subject,
  year: "2026–2027",
  weeklyHours: 4,
});
export const emptyDraft = (): RegistrationDraft => ({
  step: 0,
  personal: {
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    avatar: "",
  },
  professional: {
    school: { name: "", type: "Davlat maktabi", region: "", district: "" },
    primarySubject: "Matematika",
    additionalSubjects: [],
    experienceRange: "0–1 yil",
    education: "Bakalavr",
    languages: ["O‘zbek"],
  },
  classes: [],
  employment: {
    type: "To‘liq stavka",
    weeklyHours: 0,
    workSchedule: "",
    startDate: "",
    currency: "UZS",
  },
});
