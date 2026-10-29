import { teacherClasses } from "@/services/api/onboardingRepository";
import { ProfileSections } from "@/features/onboarding/ProfileSections";
import { useState } from "react";
import { useAuth } from "@/stores/useAuth";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  Check,
  ArrowUpRight,
  Sun,
  Moon,
  Monitor,
  Save,
  Upload,
  LogOut,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/stores/useStore";
import type { Teacher } from "@/types";
import {
  PageHead,
  Card,
  Button,
  Badge,
  Field,
  Empty,
  Modal,
  Confirm,
  DemoNote,
  Progress,
} from "@/components/common";
export function Notifications() {
  const { db, mutate } = useStore();
  const [filter, setFilter] = useState("Barchasi");
  const items = db.notifications.filter(
    (n) =>
      filter === "Barchasi" ||
      (filter === "O‘qilmagan" && !n.read) ||
      n.type === filter,
  );
  return (
    <>
      <PageHead
        title="Bildirishnomalar"
        description="Ish maydoningizdagi yangiliklardan xabardor bo‘ling."
        action={
          <Button
            variant="outline"
            onClick={() =>
              mutate((d) => {
                d.notifications.forEach((n) => {
                  n.read = true;
                });
              })
            }
          >
            <CheckCheck size={16} />
            Barchasini o‘qilgan qilish
          </Button>
        }
      />
      <div className="tabs">
        {[
          "Barchasi",
          "O‘qilmagan",
          "Vazifalar",
          "Testlar",
          "Eslatmalar",
          "Tizim",
        ].map((t) => (
          <button
            className={filter === t ? "active" : ""}
            key={t}
            onClick={() => setFilter(t)}
          >
            {t}
            {t === "O‘qilmagan" && (
              <span>{db.notifications.filter((n) => !n.read).length}</span>
            )}
          </button>
        ))}
      </div>
      <Card>
        {items.length ? (
          items.map((n) => (
            <div
              className={"notice-row " + (!n.read ? "unread" : "")}
              key={n.id}
            >
              <span className="icon-box blue">
                <Bell size={19} />
              </span>
              <Link
                to={n.href}
                onClick={() =>
                  mutate((d) => {
                    const item = d.notifications.find((x) => x.id === n.id);
                    if (item) item.read = true;
                  })
                }
              >
                <h3>
                  {n.title}
                  {!n.read && <i />}
                </h3>
                <p>{n.body}</p>
                <small>{n.date}</small>
              </Link>
              <Button
                size="icon"
                variant="ghost"
                title="O‘qilgan qilish"
                onClick={() =>
                  mutate((d) => {
                    const item = d.notifications.find((x) => x.id === n.id);
                    if (item) item.read = !item.read;
                  })
                }
              >
                <Check size={17} />
              </Button>
              <Confirm
                onConfirm={() =>
                  mutate((d) => {
                    d.notifications = d.notifications.filter(
                      (x) => x.id !== n.id,
                    );
                  })
                }
              >
                <Button size="icon" variant="ghost" title="O‘chirish">
                  <Trash2 size={17} />
                </Button>
              </Confirm>
            </div>
          ))
        ) : (
          <Empty title="Barcha yangiliklar ko‘rib chiqildi" />
        )}
      </Card>
    </>
  );
}
export function Profile() {
  const { db, mutate } = useStore();
  const [profile, setProfile] = useState<Teacher>({ ...db.teacher });
  const fields: [keyof Teacher, string, string?][] = [
    ["firstName", "Ism"],
    ["lastName", "Familiya"],
    ["email", "Elektron pochta", "email"],
    ["school", "Maktab"],
    ["subject", "Fanlar"],
    ["grades", "Dars beriladigan sinflar"],
    ["experience", "Tajriba"],
  ];
  const completeness = Math.round(
    (Object.values(profile).filter(Boolean).length /
      Object.keys(profile).length) *
      100,
  );
  return (
    <>
      <PageHead
        title="Profilim"
        description="O‘zingiz va o‘qituvchilik faoliyatingiz haqida."
      />
      <div className="profile-layout">
        <Card>
          <div className="profile-summary">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                className="profile-photo"
                alt="Profil rasmi"
              />
            ) : (
              <span className="avatar profile-avatar">
                <User size={35} />
              </span>
            )}
            <h2>
              {profile.firstName} {profile.lastName}
            </h2>
            <p>{profile.subject} o‘qituvchisi</p>
            <Badge>Matematika o‘qituvchisi</Badge>
          </div>
          <div className="progress-label">
            <span>Profil to‘ldirilgan</span>
            <b>{completeness}%</b>
          </div>
          <Progress value={completeness} />
        </Card>
        <Card>
          <h2>Shaxsiy ma’lumotlar</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutate((d) => {
                d.teacher = profile;
                const p = d.teacherProfiles.find((p) => p.id === profile.id);
                if (p) Object.assign(p, profile);
              });
              toast.success("Profilingiz shu brauzerda saqlandi");
            }}
          >
            <label className="avatar-upload">
              <Upload size={18} />
              Rasm tanlash
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 1024 * 1024) {
                    toast.error("1 MB dan kichik rasm tanlang");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () =>
                    setProfile((p) => ({
                      ...p,
                      avatar: String(reader.result),
                    }));
                  reader.readAsDataURL(f);
                }}
              />
            </label>
            <div className="form-grid">
              {fields.map(([key, label, type]) => (
                <Field label={label} key={key}>
                  {key === "subject" ? (
                    <select
                      value={profile.subject}
                      onChange={(e) =>
                        setProfile({ ...profile, subject: e.target.value })
                      }
                    >
                      {["Matematika", "Algebra", "Geometriya"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required={["firstName", "lastName", "email"].includes(
                        key,
                      )}
                      type={type || "text"}
                      min={0}
                      max={70}
                      value={profile[key]}
                      onChange={(e) =>
                        setProfile({ ...profile, [key]: e.target.value })
                      }
                    />
                  )}
                </Field>
              ))}
            </div>
            <Field label="O‘zim haqimda">
              <textarea
                rows={4}
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
              />
            </Field>
            <Button>
              <Save size={16} />
              O‘zgarishlarni saqlash
            </Button>
          </form>
        </Card>
      </div>
      <ProfileSections />
    </>
  );
}
function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="setting-row">
      <div>
        <h3>{label}</h3>
        <p>{description}</p>
      </div>
      <button
        className={"switch " + (value ? "on" : "")}
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
      >
        <span />
      </button>
    </div>
  );
}
export function Settings() {
  const navigate = useNavigate();
  const { db, mutate, reset } = useStore();
  const [tab, setTab] = useState("Umumiy");
  const [deletion, setDeletion] = useState(false);
  const preference = (key: string, value: string | boolean) =>
    mutate((d) => {
      d.preferences[key] = value;
    });
  return (
    <>
      <PageHead
        title="Sozlamalar"
        description="Ish maydoningizni o‘zingizga moslang."
      />
      <div className="tabs">
        {[
          "Umumiy",
          "Ko‘rinish",
          "Bildirishnomalar",
          "Til",
          "Maxfiylik",
          "Hisob",
        ].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="narrow">
        <Card>
          {tab === "Umumiy" ? (
            <>
              <h2>Standart sozlamalar</h2>
              <Field label="Asosiy fan">
                <select
                  value={String(
                    db.preferences.defaultSubject || db.teacher.subject,
                  )}
                  onChange={(e) => preference("defaultSubject", e.target.value)}
                >
                  {["Matematika", "Algebra", "Geometriya"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="Asosiy sinf">
                <select
                  value={String(db.preferences.defaultClass)}
                  onChange={(e) => preference("defaultClass", e.target.value)}
                >
                  {teacherClasses(db).map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <DemoNote>
                Tanlovlar avtomatik ravishda shu brauzerda saqlanadi.
              </DemoNote>
              <Link className="text-link" to="/teacher/profile">
                Profilni tahrirlash
                <ArrowUpRight size={14} />
              </Link>
            </>
          ) : tab === "Ko‘rinish" ? (
            <>
              <h2>Interfeys ko‘rinishi</h2>
              <p>Ko‘zingizga qulay mavzuni tanlang.</p>
              <div className="theme-options">
                {[
                  { id: "light", name: "Yorug‘", icon: Sun },
                  { id: "dark", name: "Tungi", icon: Moon },
                  { id: "system", name: "Tizim", icon: Monitor },
                ].map((t) => (
                  <button
                    className={db.preferences.theme === t.id ? "selected" : ""}
                    key={t.id}
                    onClick={() => preference("theme", t.id)}
                  >
                    <t.icon size={27} />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </>
          ) : tab === "Bildirishnomalar" ? (
            <>
              <h2>Bildirishnoma afzalliklari</h2>
              {["Vazifalar", "Testlar", "Eslatmalar", "Tizim yangiliklari"].map(
                (x) => (
                  <Toggle
                    label={x}
                    description="Demo bildirishnoma afzalligi"
                    key={x}
                    value={db.preferences[x] !== false}
                    onChange={(v) => preference(x, v)}
                  />
                ),
              )}
              <DemoNote>Tashqi xabar yuborish tizimi ulanmagan.</DemoNote>
            </>
          ) : tab === "Til" ? (
            <>
              <h2>Interfeys tili</h2>
              <Field label="Til">
                <select
                  value="uz"
                  onChange={(e) => {
                    if (e.target.value !== "uz")
                      toast.info(
                        "Rus va ingliz tarjimalari keyingi bosqichda qo‘shiladi.",
                      );
                  }}
                >
                  <option value="uz">O‘zbek</option>
                  <option value="ru">Русский — rejalashtirilgan</option>
                  <option value="en">English — rejalashtirilgan</option>
                </select>
              </Field>
              <p>Hozir o‘zbekcha interfeys to‘liq qo‘llab-quvvatlanadi.</p>
            </>
          ) : tab === "Maxfiylik" ? (
            <>
              <h2>Demo maxfiylik sozlamalari</h2>
              <Toggle
                label="Profil ko‘rinishi"
                description="Faqat demo afzalligi sifatida saqlanadi."
                value={Boolean(db.preferences.privacy)}
                onChange={(v) => preference("privacy", v)}
              />
              <DemoNote>
                Demo ma’lumotlar brauzeringizning localStorage xotirasida
                saqlanadi.
              </DemoNote>
            </>
          ) : (
            <>
              <h2>Hisob va mahalliy ma’lumotlar</h2>
              <p>{db.teacher.email}</p>
              <div className="setting-row">
                <div>
                  <h3>Ish maydonini tozalash</h3>
                  <p>
                    Hujjatlar, sinflar va jadval o‘chadi. Profilingiz saqlanadi.
                  </p>
                </div>
                <Confirm
                  title="Ish maydonidagi hujjatlar va sinflar tozalansinmi?"
                  onConfirm={() => {
                    reset();
                    toast.success("Ish maydoni tozalandi, profil saqlandi");
                  }}
                >
                  <Button variant="outline">Tozalash</Button>
                </Confirm>
              </div>
              <div className="button-row">
                <Button
                  variant="outline"
                  onClick={() => {
                    useAuth.getState().logout();
                    navigate("/login");
                    toast.success("Hisobdan chiqdingiz");
                  }}
                >
                  <LogOut size={16} />
                  Hisobdan chiqish
                </Button>
                <Button variant="danger" onClick={() => setDeletion(true)}>
                  <Trash2 size={16} />
                  Hisobni o‘chirish
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
      <Modal
        open={deletion}
        onOpenChange={setDeletion}
        title="Hisobni o‘chirish — demo"
      >
        <p>
          Haqiqiy hisob mavjud emas, shuning uchun bu yerda hisob o‘chirilmaydi.
          Brauzerdagi ma’lumotlarni «Ish maydonini tozalash» orqali
          tozalashingiz mumkin.
        </p>
        <Button onClick={() => setDeletion(false)}>Tushunarli</Button>
      </Modal>
    </>
  );
}
