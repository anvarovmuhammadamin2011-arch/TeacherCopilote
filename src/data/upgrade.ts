import {
  isSupportedSubject,
  normalizeSubject,
} from "@/features/workspace/subjects";
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
      currentTopic: c.currentTopic,
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
      kind: q.kind,
      answerFormat: q.answerFormat,
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
  const archive = (raw as Partial<Database> | null)?.legacyArchive;
  const merge = <T extends { id: string }>(a: T[], b: T[]) => [
    ...new Map([...a, ...b].map((x) => [x.id, x])).values(),
  ];
  const lessons = merge(archive?.lessons || [], db.lessons),
    quizzes = merge(archive?.quizzes || [], db.quizzes),
    documents = merge(archive?.documents || [], db.documents),
    materials = merge(archive?.materials || [], db.materials);
  db.legacyArchive = {
    lessons: lessons.filter((x) => !isSupportedSubject(x.subject)),
    quizzes: quizzes.filter((x) => !isSupportedSubject(x.subject)),
    documents: documents.filter((x) => !isSupportedSubject(x.subject)),
    materials: materials.filter(
      (x) => x.subject && !isSupportedSubject(x.subject),
    ),
  };
  db.lessons = lessons
    .filter((x) => isSupportedSubject(x.subject))
    .map((x) => ({ ...x, subject: x.subject }));
  db.quizzes = quizzes
    .filter((x) => isSupportedSubject(x.subject))
    .map((x) => ({ ...x, subject: x.subject }));
  db.documents = documents
    .filter((x) => isSupportedSubject(x.subject))
    .map((x) => ({ ...x, subject: x.subject }));
  db.materials = materials
    .filter((x) => !x.subject || isSupportedSubject(x.subject))
    .map((x) => ({
      ...x,
      ...(x.subject ? { subject: x.subject } : {}),
    }));
  db.teacher.subject = normalizeSubject(db.teacher.subject);
  db.teacherProfiles = db.teacherProfiles
    .filter((p) => p.id !== "teacher-demo")
    .map((p) => ({
      ...p,
      subject: normalizeSubject(p.subject),
      professional: {
        ...p.professional,
        primarySubject: normalizeSubject(p.professional.primarySubject),
        additionalSubjects: [
          ...new Set(
            p.professional.additionalSubjects
              .filter(isSupportedSubject)
              .map(normalizeSubject),
          ),
        ].filter((s) => s !== normalizeSubject(p.professional.primarySubject)),
      },
    }));
  const active = new Map<string, (typeof db.teacherClassAssignments)[number]>();
  const archived: typeof db.teacherClassAssignments = [];
  db.teacherClassAssignments.forEach((a) => {
    if (a.archived || !isSupportedSubject(a.subject)) {
      archived.push({ ...a, archived: true });
      return;
    }
    const value = { ...a, subject: normalizeSubject(a.subject) };
    const key = value.teacherId + "|" + value.classId + "|" + value.subject;
    const previous = active.get(key);
    if (previous) previous.weeklyHours += value.weeklyHours;
    else active.set(key, value);
  });
  db.teacherClassAssignments = [...active.values(), ...archived];
  const usable = new Set(
    db.teacherClassAssignments.filter((a) => !a.archived).map((a) => a.classId),
  );
  db.classes = db.classes.map((c) => ({
    ...c,
    archived: c.archived || !usable.has(c.id),
    subject:
      db.teacherClassAssignments.find((a) => a.classId === c.id && !a.archived)
        ?.subject || normalizeSubject(c.subject),
  }));
  db.events = db.events.filter((e) => !e.classId || usable.has(e.classId));
  db.preferences.defaultSubject = normalizeSubject(
    String(db.preferences.defaultSubject),
  );
  db.preferences.defaultClass = usable.has(String(db.preferences.defaultClass))
    ? db.preferences.defaultClass
    : db.classes.find((c) => !c.archived)?.id || "";
  return db;
}
