import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  ClipboardList,
  NotebookPen,
  School,
  CalendarDays,
  ChartNoAxesCombined,
  FolderOpen,
  Settings,
  User,
  FileSearch,
  FileText,
} from "lucide-react";
export const navigation = [
  {
    title: "ASOSIY",
    items: [
      { name: "Boshqaruv paneli", path: "", icon: LayoutDashboard },
      {
        name: "AI yordamchi",
        path: "ai-assistant",
        icon: Sparkles,
        badge: "AI",
      },
    ],
  },
  {
    title: "AI VOSITALAR",
    items: [
      { name: "Dars rejasi yaratish", path: "lessons/create", icon: BookOpen },
      { name: "Test yaratish", path: "quizzes/create", icon: ClipboardList },
      { name: "Konspekt yaratish", path: "conspects", icon: FileText },
      { name: "Uy vazifasi yaratish", path: "homework", icon: NotebookPen },
      { name: "PDF tahlil", path: "pdf-analyzer", icon: FileSearch },
    ],
  },
  {
    title: "ISH FAOLIYATI",
    items: [
      { name: "Sinflarim", path: "classes", icon: School },
      { name: "Dars jadvali", path: "calendar", icon: CalendarDays },
      { name: "Materiallarim", path: "materials", icon: FolderOpen },
    ],
  },
  {
    title: "HISOB",
    items: [
      { name: "Statistika", path: "statistics", icon: ChartNoAxesCombined },
      { name: "Profilim", path: "profile", icon: User },
      { name: "Sozlamalar", path: "settings", icon: Settings },
    ],
  },
];
