import { mathLessonSections } from "@/features/mathematics/curriculum";
import type { Database, LessonSection } from "@/types";
import { today } from "@/utils/cn";
import { addDays, format } from "date-fns";
export const subjects = ["Matematika", "Algebra", "Geometriya"];
export const lessonSections = (topic: string, duration = 45): LessonSection[] =>
  mathLessonSections(topic, duration);

export function seed(): Database {
  const teacher = {
    id: "workspace-default",
    firstName: "Matematika",
    lastName: "Ustozi",
    email: "",
    school: "Namuna maktabi",
    subject: "Matematika",
    grades: "8, 9",
    experience: "3–5 yil",
    bio: "",
    avatar: "",
  };
  return {
    teacher,
    teacherProfiles: [],
    classes: [
      {
        id: "c1",
        name: "8-A",
        subject: "Matematika",
        grade: 8,
        year: "2026–2027",
        description: "Matematika darslari",
        schoolName: teacher.school,
      },
      {
        id: "c2",
        name: "9-B",
        subject: "Geometriya",
        grade: 9,
        year: "2026–2027",
        description: "Geometriya darslari",
        schoolName: teacher.school,
      },
    ],
    teacherClassAssignments: [
      {
        id: "ta1",
        teacherId: teacher.id,
        classId: "c1",
        subject: "Matematika",
        weeklyHours: 4,
        archived: false,
      },
      {
        id: "ta2",
        teacherId: teacher.id,
        classId: "c2",
        subject: "Geometriya",
        weeklyHours: 4,
        archived: false,
      },
    ],
    lessons: [
      {
        id: "l1",
        title: "Oddiy kasrlar",
        subject: "Matematika",
        grade: "8",
        duration: 45,
        date: today(),
        status: "Tayyor",
        sections: lessonSections("Oddiy kasrlar"),
      },
    ],
    quizzes: [],
    documents: [],
    materials: [
      {
        id: "m1",
        title: "Darsga tayyorgarlik ro‘yxati",
        category: "Qaydlar",
        size: "Qayd",
        date: today(),
        favorite: true,
        content:
          "Maqsadni belgilang. Misollar va mashqlarni tayyorlang. Yakuniy savollarni rejalashtiring.",
        folder: "Umumiy",
      },
    ],
    events: [
      {
        id: "e1",
        title: "8-A · Matematika",
        date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
        time: "09:00",
        type: "Dars",
        description: "Kasrlar mavzusini mustahkamlash",
        classId: "c1",
      },
    ],
    notifications: [],
    conversations: [],
    preferences: {
      theme: "light",
      defaultSubject: "Matematika",
      defaultClass: "c1",
    },
    aiUsage: [],
  };
}
