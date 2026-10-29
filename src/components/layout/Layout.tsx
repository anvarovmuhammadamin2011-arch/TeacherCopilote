import { useEffect, useState } from "react";
import {
  NavLink,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  PanelLeft,
  Search,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Command,
  LogOut,
  User,
  Settings,
  GraduationCap,
  Check,
} from "lucide-react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { navigation } from "@/constants";
import { useStore } from "@/stores/useStore";
import { Button, Modal, SearchInput, Empty } from "@/components/common";
import { useAuth } from "@/stores/useAuth";
import { toast } from "sonner";
export default function Layout() {
  const { db, mutate } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const dark =
    db.preferences.theme === "dark" ||
    (db.preferences.theme === "system" &&
      matchMedia("(prefers-color-scheme: dark)").matches);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearch((v) => !v);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  useEffect(() => {
    setMobile(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const sectionPath =
    location.pathname.includes("/lessons") ||
    location.pathname.includes("/conspects")
      ? "prepare"
      : location.pathname.includes("/quizzes") ||
          location.pathname.includes("/homework") ||
          location.pathname.includes("/exercises")
        ? "tasks"
        : location.pathname.includes("/calendar")
          ? "classes"
          : location.pathname.split("/")[2] || "";
  const active = navigation
    .flatMap((n) => n.items)
    .find((n) =>
      n.path ? sectionPath === n.path : location.pathname === "/teacher",
    );
  const groups = [
    {
      title: "Darslar",
      items: db.lessons.map((x) => ({
        title: x.title,
        href: "/teacher/lessons/" + x.id,
      })),
    },
    {
      title: "Testlar",
      items: db.quizzes.map((x) => ({
        title: x.title,
        href: "/teacher/quizzes/" + x.id,
      })),
    },
    {
      title: "Vazifalar",
      items: db.documents.map((x) => ({
        title: x.title,
        href:
          "/teacher/" +
          (x.kind === "conspect"
            ? "conspects"
            : x.kind === "exercise"
              ? "exercises"
              : "homework") +
          "/" +
          x.id,
      })),
    },
    {
      title: "Sinflar",
      items: db.classes.map((x) => ({
        title: x.name,
        href: "/teacher/classes/" + x.id,
      })),
    },
    {
      title: "Materiallar",
      items: db.materials.map((x) => ({
        title: x.title,
        href: "/teacher/materials?search=" + encodeURIComponent(x.title),
      })),
    },
  ].map((g) => ({
    ...g,
    items: g.items
      .filter((x) =>
        x.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
      )
      .slice(0, 5),
  }));
  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
      {mobile && (
        <button
          className="mobile-overlay"
          aria-label="Menyuni yopish"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <Link to="/teacher" className="brand">
          <div className="brand-symbol">
            <GraduationCap size={25} />
          </div>
          <div className="brand-text">
            TeacherCopilot <span>AI</span>
            <small>USTOZNING ISH MAYDONI</small>
          </div>
        </Link>
        <div className="workspace-label">
          <span className="workspace-icon">M</span>
          <div>
            Mening ish maydonim<small>O‘qituvchi hisobi</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <nav>
          {navigation.map((group) => (
            <div className="nav-group" key={group.title}>
              <p>{group.title}</p>
              {group.items.map((item) => (
                <NavLink
                  end={!item.path}
                  title={collapsed ? item.name : undefined}
                  key={item.path}
                  to={"/teacher" + (item.path ? "/" + item.path : "")}
                  className={() =>
                    "nav-item " + (sectionPath === item.path ? "active" : "")
                  }
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <span className="avatar">
              {db.teacher.firstName[0]}
              {db.teacher.lastName[0]}
            </span>
            <div>
              {db.teacher.firstName} {db.teacher.lastName}
              <small>{db.teacher.subject} o‘qituvchisi</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <div className="topbar-left">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Menyuni ochish yoki yopish"
              onClick={() =>
                window.innerWidth < 1024
                  ? setMobile((v) => !v)
                  : setCollapsed((v) => !v)
              }
            >
              <PanelLeft size={19} />
            </Button>
            <span className="breadcrumb">
              Ish maydoni <ChevronRight size={13} />
              <b>
                {active?.name ||
                  (location.pathname.includes("/quizzes")
                    ? "Testlar"
                    : location.pathname.includes("/lessons")
                      ? "Darslarim"
                      : location.pathname.includes("/notifications")
                        ? "Bildirishnomalar"
                        : "Ish maydoni")}
              </b>
            </span>
          </div>
          <div className="topbar-right">
            <button className="global-search" onClick={() => setSearch(true)}>
              <Search size={16} />
              <span>Qidirish…</span>
              <kbd>⌘ K</kbd>
            </button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Mavzuni almashtirish"
              onClick={() =>
                mutate((d) => {
                  d.preferences.theme = dark ? "light" : "dark";
                })
              }
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <span className="header-divider" />
            <Dropdown.Root>
              <Dropdown.Trigger asChild>
                <button className="avatar-button" aria-label="Profil menyusi">
                  <span className="avatar small">
                    {db.teacher.firstName[0]}
                    {db.teacher.lastName[0]}
                  </span>
                  <ChevronDown size={13} />
                </button>
              </Dropdown.Trigger>
              <Dropdown.Portal>
                <Dropdown.Content
                  className="dropdown"
                  align="end"
                  sideOffset={12}
                >
                  <p>
                    {db.teacher.firstName} {db.teacher.lastName}
                    <small>{db.teacher.email}</small>
                  </p>
                  {[
                    { label: "Profilim", to: "profile", icon: User },
                    { label: "Sozlamalar", to: "settings", icon: Settings },
                  ].map((x) => (
                    <Dropdown.Item
                      key={x.to}
                      onSelect={() => navigate("/teacher/" + x.to)}
                    >
                      <x.icon size={16} />
                      {x.label}
                    </Dropdown.Item>
                  ))}
                  <Dropdown.Separator />
                  <Dropdown.Item
                    onSelect={() => {
                      useAuth.getState().logout();
                      navigate("/login");
                      toast.success("Hisobdan chiqdingiz");
                    }}
                  >
                    <LogOut size={16} />
                    Hisobdan chiqish
                  </Dropdown.Item>
                </Dropdown.Content>
              </Dropdown.Portal>
            </Dropdown.Root>
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>© 2026 TeacherCopilot AI</span>
          <span>
            <Check size={12} />
            Demo muhit · Qurilmangizda saqlanadi
          </span>
        </footer>
      </div>
      <Modal
        open={search}
        onOpenChange={setSearch}
        title="Ish maydonidan qidirish"
        description="Darslar, testlar, sinflar va boshqa ma’lumotlar bo‘yicha qidirish."
      >
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Nimani izlayapsiz?"
        />
        <div className="search-results">
          {groups.some((g) => g.items.length) ? (
            groups
              .filter((g) => g.items.length)
              .map((g) => (
                <div key={g.title}>
                  <h4>{g.title}</h4>
                  {g.items.map((x) => (
                    <button
                      key={x.href}
                      onClick={() => {
                        navigate(x.href);
                        setSearch(false);
                      }}
                    >
                      <Search size={15} />
                      {x.title}
                      <ChevronRight size={14} />
                    </button>
                  ))}
                </div>
              ))
          ) : (
            <Empty title="Natija topilmadi" />
          )}
        </div>
        <div className="search-footer">
          <Command size={13} /> Ctrl + K bilan tezkor ochish
        </div>
      </Modal>
    </div>
  );
}
