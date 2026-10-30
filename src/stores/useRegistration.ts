import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RegistrationDraft } from "@/types";
import { emptyDraft } from "@/features/onboarding/schema";
interface State {
  draft: RegistrationDraft;
  update: (patch: Partial<RegistrationDraft>) => void;
  clear: () => void;
}
export const useRegistration = create<State>()(
  persist(
    (set) => ({
      draft: emptyDraft(),
      update: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      clear: () => set({ draft: emptyDraft() }),
    }),
    {
      name: "teachercopilot-registration-draft-v1",
      version: 5,
      migrate: () => ({ draft: emptyDraft() }),
      partialize: (s) => ({
        draft: {
          step: s.draft.step,
          personal: {
            firstName: s.draft.personal.firstName,
            lastName: s.draft.personal.lastName,
            middleName: s.draft.personal.middleName,
            email: s.draft.personal.email,
            phone: s.draft.personal.phone,
            avatar: s.draft.personal.avatar,
          },
          professional: s.draft.professional,
          classes: s.draft.classes.map((c) => ({
            id: c.id,
            name: c.name,
            grade: c.grade,
            section: c.section,
            subject: c.subject,
            year: c.year,
            weeklyHours: c.weeklyHours,
          })),
          employment: {
            type: s.draft.employment.type,
            weeklyHours: s.draft.employment.weeklyHours,
            workSchedule: s.draft.employment.workSchedule,
            startDate: s.draft.employment.startDate,
            currency: "UZS",
          },
        },
      }),
    },
  ),
);
