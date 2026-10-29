import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FolderOpen,
  CalendarDays,
} from "lucide-react";
export const navigation = [
  {
    title: "ISH MAYDONI",
    items: [
      { name: "Bosh sahifa", path: "", icon: LayoutDashboard },
      { name: "Dars tayyorlash", path: "prepare", icon: BookOpen },
      { name: "Topshiriqlar", path: "tasks", icon: ClipboardList },
      { name: "Materiallarim", path: "materials", icon: FolderOpen },
      { name: "Sinflar va jadval", path: "classes", icon: CalendarDays },
    ],
  },
];
