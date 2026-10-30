export interface LessonSection {
  title: string;
  minutes: number;
  content: string;
}
export interface Lesson {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: number;
  status: string;
  date: string;
  sections: LessonSection[];
}
export interface ClassRoom {
  currentTopic?: string;
  id: string;
  name: string;
  subject: string;
  year: string;
  description: string;
  grade?: number;
  section?: string;
  schoolName?: string;
  archived?: boolean;
}
export interface Question {
  solution?: string;
  id: string;
  text: string;
  type: string;
  options: string[];
  correct: number;
  answer: string;
  points: number;
  correctAnswers?: number[];
  pairs?: { left: string; right: string }[];
}
export interface Quiz {
  kind?: "test" | "assessment";
  answerFormat?: "answer" | "steps";
  id: string;
  title: string;
  subject: string;
  grade: string;
  classId: string;
  status: string;
  questions: Question[];
  time: number;
  date: string;
  difficulty?: string;
  language?: string;
  variants?: { label: string; questions: Question[] }[];
}
export interface Notice {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  date: string;
  href: string;
}
export interface CalendarEvent {
  classId?: string;
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  description: string;
}
export interface Material {
  folder?: string;
  id: string;
  title: string;
  category: string;
  size: string;
  date: string;
  favorite: boolean;
  content: string;
  classIds?: string[];
  subject?: string;
  resourceType?: string;
  assetUrl?: string;
}
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}
export interface Teacher {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  subject: string;
  grades: string;
  experience: string;
  bio: string;
  avatar: string;
}
export interface School {
  name: string;
  type: string;
  region: string;
  district: string;
}
export interface TeacherProfessionalInfo {
  school: School;
  primarySubject: string;
  additionalSubjects: string[];
  experienceRange: string;
  education: string;
  languages: string[];
}
export interface TeacherEmploymentInfo {
  type: string;
  weeklyHours: number;
  workSchedule: string;
  startDate: string;
  currency: "UZS";
}
export interface TeacherProfile extends Teacher {
  id: string;
  middleName: string;
  phone: string;
  professional: TeacherProfessionalInfo;
  employment: TeacherEmploymentInfo;
}
export interface TeacherClassAssignment {
  id: string;
  teacherId: string;
  classId: string;
  subject: string;
  weeklyHours: number;
  archived: boolean;
}
export interface RegistrationClass {
  id: string;
  name: string;
  grade: number;
  section: string;
  subject: string;
  year: string;
  weeklyHours: number;
}
export interface RegistrationDraft {
  step: number;
  personal: {
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    phone: string;
    avatar: string;
  };
  professional: TeacherProfessionalInfo;
  classes: RegistrationClass[];
  employment: TeacherEmploymentInfo;
}

export interface TeachingDocument {
  answerFormat?: "answer" | "steps";
  variants?: number;
  level?: string;
  count?: number;
  language?: string;
  id: string;
  title: string;
  kind: "conspect" | "homework" | "exercise";
  subject: string;
  grade: string;
  date: string;
  content: string;
  answerKey: string;
}
export interface AIUsage {
  id: string;
  kind: string;
  date: string;
}
export interface Database {
  legacyArchive?: {
    lessons: Lesson[];
    quizzes: Quiz[];
    documents: TeachingDocument[];
    materials: Material[];
  };
  teacher: Teacher;
  teacherProfiles: TeacherProfile[];
  teacherClassAssignments: TeacherClassAssignment[];
  classes: ClassRoom[];
  lessons: Lesson[];
  quizzes: Quiz[];
  documents: TeachingDocument[];
  materials: Material[];
  events: CalendarEvent[];
  notifications: Notice[];
  conversations: Conversation[];
  preferences: Record<string, string | boolean>;
  aiUsage: AIUsage[];
}
export type UserRole = "teacher";
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isDemo: true;
}
