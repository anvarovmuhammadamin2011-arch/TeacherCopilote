import { isMathSubject } from "@/features/mathematics/curriculum";
import { seed } from "./seed";
import type { Database } from "@/types";
// Explicit allowlist: retired accounts, rosters, submissions, attendance and invitation codes never enter v4.
function upgradeTeacherDatabase(raw: unknown): Database {
  const base = seed();
  const old = (raw || {}) as Partial<Database>;
  const t = old.teacher || base.teacher;
  const teacher = {
    id: t.id,
    firstName: t.firstName,
    lastName: t.lastName,
    email: t.email,
    school: t.school,
    subject: t.subject,
    grades: t.grades,
    experience: t.experience,
    bio: t.bio,
    avatar: t.avatar,
  };
  return {
    teacher,
    teacherProfiles: (old.teacherProfiles || base.teacherProfiles).map((p) => ({
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
      middleName: p.middleName,
      phone: p.phone,
      professional: p.professional,
      employment: {
        type: p.employment.type,
        weeklyHours: p.employment.weeklyHours,
        workSchedule: p.employment.workSchedule,
        startDate: p.employment.startDate,
        currency: "UZS",
      },
    })),
    classes: (old.classes || base.classes).map((c) => ({
      id: c.id,
      name: c.name,
      subject: c.subject,
      year: c.year,
      description: c.description,
      grade: c.grade,
      section: c.section,
      schoolName: c.schoolName,
      archived: c.archived,
    })),
    teacherClassAssignments: (
      old.teacherClassAssignments || base.teacherClassAssignments
    ).map((a) => ({
      id: a.id,
      teacherId: a.teacherId,
      classId: a.classId,
      subject: a.subject,
      weeklyHours: a.weeklyHours,
      archived: a.archived,
    })),
    lessons: old.lessons || base.lessons,
    quizzes: (old.quizzes || []).map((q) => ({
      id: q.id,
      title: q.title,
      subject: q.subject,
      grade: q.grade,
      classId: q.classId,
      status: q.status,
      questions: q.questions,
      time: q.time,
      date: q.date,
      difficulty: q.difficulty,
      language: q.language,
      variants: q.variants,
    })),
    documents:
      old.documents ||
      (
        (
          raw as {
            assignments?: {
              id: string;
              title: string;
              subject: string;
              classId: string;
              description: string;
              deadline: string;
            }[];
          }
        )?.assignments || []
      ).map((a) => ({
        id: a.id,
        title: a.title,
        kind: "homework" as const,
        subject: a.subject,
        grade: String(
          old.classes?.find((c) => c.id === a.classId)?.grade || "",
        ),
        date: a.deadline || new Date().toISOString().slice(0, 10),
        content: a.description,
        answerKey: "",
      })),
    materials: old.materials || base.materials,
    events: old.events || base.events,
    notifications: [],
    conversations: old.conversations || [],
    preferences: old.preferences || base.preferences,
    aiUsage: old.aiUsage || [],
  };
}

export function upgradeDatabase(raw: unknown): Database {
  const db = upgradeTeacherDatabase(raw);
  const previous = (raw as Partial<Database> | null)?.legacyArchive;
  const merge = <T extends { id: string }>(old: T[], items: T[]) => [
    ...new Map([...old, ...items].map((x) => [x.id, x])).values(),
  ];
  db.legacyArchive = {
    lessons: merge(
      previous?.lessons || [],
      db.lessons.filter((x) => !isMathSubject(x.subject)),
    ),
    quizzes: merge(
      previous?.quizzes || [],
      db.quizzes.filter((x) => !isMathSubject(x.subject)),
    ),
    documents: merge(
      previous?.documents || [],
      db.documents.filter((x) => !isMathSubject(x.subject)),
    ),
    materials: merge(
      previous?.materials || [],
      db.materials.filter((x) => x.subject && !isMathSubject(x.subject)),
    ),
  };
  db.lessons = db.lessons.filter((x) => isMathSubject(x.subject));
  db.quizzes = db.quizzes.filter((x) => isMathSubject(x.subject));
  db.documents = db.documents.filter((x) => isMathSubject(x.subject));
  db.materials = db.materials.filter(
    (x) => !x.subject || isMathSubject(x.subject),
  );
  db.teacher.subject = isMathSubject(db.teacher.subject)
    ? db.teacher.subject
    : "Matematika";
  db.teacherProfiles = db.teacherProfiles
    .filter((p) => p.id !== "teacher-demo")
    .map((p) => ({
      ...p,
      subject: isMathSubject(p.subject) ? p.subject : "Matematika",
      professional: {
        ...p.professional,
        primarySubject: isMathSubject(p.professional.primarySubject)
          ? p.professional.primarySubject
          : "Matematika",
        additionalSubjects:
          p.professional.additionalSubjects.filter(isMathSubject),
      },
    }));
  db.teacherClassAssignments = db.teacherClassAssignments.map((a) => ({
    ...a,
    archived: a.archived || !isMathSubject(a.subject),
  }));
  const usable = new Set(
    db.teacherClassAssignments.filter((a) => !a.archived).map((a) => a.classId),
  );
  db.classes = db.classes.map((c) => ({
    ...c,
    archived: c.archived || !usable.has(c.id),
    subject:
      db.teacherClassAssignments.find((a) => a.classId === c.id && !a.archived)
        ?.subject || c.subject,
  }));
  db.events = db.events.filter((e) => !e.classId || usable.has(e.classId));
  db.preferences.defaultSubject = isMathSubject(
    String(db.preferences.defaultSubject),
  )
    ? db.preferences.defaultSubject
    : "Matematika";
  db.preferences.defaultClass = usable.has(String(db.preferences.defaultClass))
    ? db.preferences.defaultClass
    : db.classes.find((c) => !c.archived)?.id || "";
  return db;
}
