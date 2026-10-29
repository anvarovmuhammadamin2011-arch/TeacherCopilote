export const supportedLocales = ["uz", "ru", "en"] as const;
export type Locale = (typeof supportedLocales)[number];
export const messages = {
  uz: {
    save: "Saqlash",
    cancel: "Bekor qilish",
    create: "Yaratish",
    search: "Qidirish",
    required: "Bu maydonni to‘ldirish majburiy.",
  },
};
export const translate = (key: keyof typeof messages.uz) => messages.uz[key];
