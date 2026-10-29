import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Pencil,
  School,
  BookOpen,
  BriefcaseBusiness,
  ShieldCheck,
  Eye,
  EyeOff,
  Phone,
  Save,
} from "lucide-react";
import { useStore } from "@/stores/useStore";
import {
  Card,
  CardHead,
  Button,
  Field,
  Badge,
  DemoNote,
} from "@/components/common";
import { classWeeklyHours } from "@/services/api/onboardingRepository";
import { toast } from "sonner";
export function ProfileSections() {
  const { db, mutate } = useStore();
  const p = db.teacherProfiles.find((p) => p.id === db.teacher.id);
  const [salary, setSalary] = useState("");
  const [visible, setVisible] = useState(false);
  const [phone, setPhone] = useState(p?.phone || "");
  const [middleName, setMiddleName] = useState(p?.middleName || "");
  if (!p) return null;
  const assignedIds = new Set(
    db.teacherClassAssignments
      .filter((a) => a.teacherId === p.id && !a.archived)
      .map((a) => a.classId),
  );
  const classes = db.classes.filter((c) => assignedIds.has(c.id));
  return (
    <div className="professional-profile-sections">
      <Card>
        <CardHead
          title="Qo‘shimcha shaxsiy ma’lumotlar"
          subtitle="Demo profildagi ism va aloqa ma’lumotlari."
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutate((d) => {
              const profile = d.teacherProfiles.find((t) => t.id === p.id);
              if (profile) {
                profile.phone = phone;
                profile.middleName = middleName;
              }
            });
            toast.success("Demo shaxsiy ma’lumotlar yangilandi");
          }}
        >
          <div className="form-grid">
            <Field label="Otasining ismi">
              <input
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
            </Field>
            <Field label="Telefon (ixtiyoriy)">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
          </div>
          <Button variant="outline">
            <Phone size={15} />
            Ma’lumotlarni saqlash
          </Button>
        </form>
      </Card>
      <Card>
        <CardHead
          title="Kasbiy ma’lumotlar"
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/teacher/onboarding?edit=1">
                <Pencil size={14} />
                Tahrirlash
              </Link>
            </Button>
          }
        />
        <div className="profile-detail-sections">
          <div>
            <School size={20} />
            <h3>{p.professional.school.name}</h3>
            <p>
              {p.professional.school.type} · {p.professional.school.region} ·{" "}
              {p.professional.school.district}
            </p>
          </div>
          <div>
            <BookOpen size={20} />
            <h3>Dars beriladigan fanlar</h3>
            <div className="subject-chips">
              {[
                p.professional.primarySubject,
                ...p.professional.additionalSubjects,
              ].map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
            <p>
              {p.professional.experienceRange} tajriba ·{" "}
              {p.professional.education}
              <br />
              {p.professional.languages.join(", ")} tilida dars beriladi
            </p>
          </div>
        </div>
      </Card>
      <Card>
        <CardHead
          title="Biriktirilgan sinflar"
          action={
            <Button variant="outline" size="sm" asChild>
              <Link to="/teacher/classes">Sinflarni boshqarish</Link>
            </Button>
          }
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sinf</th>
                <th>Fanlar</th>
                <th>Haftalik soat</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link className="text-link" to={"/teacher/classes/" + c.id}>
                      {c.name}
                    </Link>
                  </td>
                  <td>
                    {db.teacherClassAssignments
                      .filter(
                        (a) =>
                          a.teacherId === p.id &&
                          a.classId === c.id &&
                          !a.archived,
                      )
                      .map((a) => a.subject)
                      .join(", ")}
                  </td>
                  <td>{classWeeklyHours(db, c.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!classes.length && (
          <p className="muted">Hozircha sinf biriktirilmagan.</p>
        )}
      </Card>
      <Card>
        <CardHead
          title="Ish faoliyati"
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/teacher/onboarding?edit=1">
                <Pencil size={14} />
                Tahrirlash
              </Link>
            </Button>
          }
        />
        <div className="employment-overview">
          <BriefcaseBusiness size={22} />
          <div>
            <h3>{p.employment.type}</h3>
            <p>
              {p.employment.weeklyHours} soat / hafta ·{" "}
              {p.employment.workSchedule || "Jadval belgilanmagan"}
            </p>
            <small>
              {p.employment.startDate
                ? "Boshlagan sana: " + p.employment.startDate
                : "Boshlagan sana kiritilmagan"}
            </small>
          </div>
        </div>
        <details className="private-salary">
          <summary>
            <ShieldCheck size={17} />
            Maosh maydoni · faqat vaqtinchalik ko‘rinish
          </summary>
          <p>
            Bu ma’lumot saqlanmaydi. Sahifadan chiqsangiz yo‘qoladi va boshqa
            kabinetlarga uzatilmaydi. Xavfsiz saqlash uchun backend kerak.
          </p>
          <Field label="Oylik maosh (UZS)">
            <div className="password-input">
              <input
                type={visible ? "number" : "password"}
                min={0}
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="Ixtiyoriy"
                autoComplete="off"
              />
              <button
                aria-label={
                  visible ? "Maoshni yashirish" : "Maoshni ko‘rsatish"
                }
                onClick={() => setVisible((v) => !v)}
                type="button"
              >
                {visible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
          <Button variant="ghost" onClick={() => setSalary("")}>
            <Save size={14} />
            Vaqtinchalik qiymatni tozalash
          </Button>
        </details>
        <DemoNote>
          Maosh profilga, umumiy statistikaga va AI so‘rovlariga kiritilmaydi.
        </DemoNote>
      </Card>
    </div>
  );
}
