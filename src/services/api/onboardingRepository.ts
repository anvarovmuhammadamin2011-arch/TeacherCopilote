import { useStore } from "@/stores/useStore";
import { useAuth } from "@/stores/useAuth";
import type {
  Database,
  RegistrationClass,
  RegistrationDraft,
  TeacherProfile,
} from "@/types";
import {
  personalSchema,
  professionalSchema,
  classesSchema,
  employmentSchema,
  classSchema,
} from "@/features/onboarding/schema";
import { uid } from "@/utils/cn";
import { delay } from "./repository";
export const activeTeacherId = (db: Database) =>
  db.teacher.id || "teacher-demo";
export const teacherClasses = (db: Database) =>
  db.classes.filter(
    (c) =>
      !c.archived &&
      db.teacherClassAssignments.some(
        (a) =>
          a.teacherId === activeTeacherId(db) &&
          a.classId === c.id &&
          !a.archived,
      ),
  );
export const classSubjects = (db: Database, id: string) => [
  ...new Set(
    db.teacherClassAssignments
      .filter(
        (a) =>
          a.classId === id &&
          a.teacherId === activeTeacherId(db) &&
          !a.archived,
      )
      .map((a) => a.subject),
  ),
];
export const classWeeklyHours = (db: Database, id: string) =>
  db.teacherClassAssignments
    .filter(
      (a) =>
        a.classId === id && a.teacherId === activeTeacherId(db) && !a.archived,
    )
    .reduce((s, a) => s + a.weeklyHours, 0);
export function addClassAssignment(
  db: Database,
  row: RegistrationClass,
  teacherId = activeTeacherId(db),
  schoolName = db.teacher.school,
) {
  classSchema.parse(row);
  let c = db.classes.find(
    (c) =>
      c.name.toLowerCase() === row.name.trim().toLowerCase() &&
      c.year === row.year &&
      c.schoolName === schoolName,
  );
  if (!c) {
    c = {
      id: uid(),
      name: row.name.trim(),
      subject: row.subject,
      grade: row.grade,
      section: row.section,
      year: row.year,
      schoolName,
      description: "",
    };
    db.classes.push(c);
  }
  if (
    db.teacherClassAssignments.some(
      (a) =>
        a.classId === c!.id &&
        a.teacherId === teacherId &&
        a.subject === row.subject &&
        !a.archived,
    )
  )
    throw new Error("Bu fan sinfga biriktirilgan.");
  db.teacherClassAssignments.push({
    id: uid(),
    classId: c.id,
    teacherId,
    subject: row.subject,
    weeklyHours: row.weeklyHours,
    archived: false,
  });
  return c.id;
}
export const onboardingRepository = {
  completeTeacher: async (
    draft: RegistrationDraft,
    password: string,
    confirmation: string,
  ) => {
    const personal = personalSchema.parse({
      ...draft.personal,
      password,
      confirmation,
    });
    const professional = professionalSchema.parse(draft.professional);
    const rows = classesSchema.parse(draft.classes);
    const employment = employmentSchema.parse(draft.employment);
    await delay(null, 650);
    let profile: TeacherProfile | undefined;
    let classIds: string[] = [];
    {
      const db = useStore.getState().db;
      const existing = db.teacherProfiles.find(
        (p) => p.email.toLowerCase() === personal.email.toLowerCase(),
      );
      const id = existing?.id || uid();
      profile = {
        id,
        firstName: personal.firstName,
        lastName: personal.lastName,
        middleName: personal.middleName,
        email: personal.email,
        phone: personal.phone,
        avatar: personal.avatar,
        school: professional.school.name,
        subject: professional.primarySubject,
        grades: [...new Set(rows.map((c) => String(c.grade)))].join(", "),
        experience: professional.experienceRange,
        bio: existing?.bio || "",
        professional,
        employment,
      };
      useStore.getState().switchTeacher(
        {
          id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          avatar: profile.avatar,
          school: profile.school,
          subject: profile.subject,
          grades: profile.grades,
          experience: profile.experience,
          bio: profile.bio,
        },
        (db) => {
          db.teacherProfiles = db.teacherProfiles.filter((p) => p.id !== id);
          db.teacherProfiles.push(profile);
          classIds = rows.map((row) =>
            addClassAssignment(db, row, id, profile!.school),
          );
        },
      );
    }
    return {
      profile: profile!,
      classCount: new Set(classIds).size,
      assignmentCount: rows.length,
    };
  },

  loginLocalProfile: (email: string, _role: "teacher", remember: boolean) => {
    const p = useStore
      .getState()
      .db.teacherProfiles.find(
        (p) =>
          p.id !== "teacher-demo" &&
          p.email.toLowerCase() === email.toLowerCase(),
      );
    if (!p) throw new Error("Avval o‘qituvchi sifatida ro‘yxatdan o‘ting.");
    useStore.getState().switchTeacher({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      school: p.school,
      subject: p.subject,
      grades: p.grades,
      experience: p.experience,
      bio: p.bio,
      avatar: p.avatar,
    });
    useAuth.getState().createSession(
      {
        id: p.id,
        name: p.firstName + " " + p.lastName,
        email: p.email,
        role: "teacher",
        isDemo: true,
      },
      remember,
    );
  },
};
