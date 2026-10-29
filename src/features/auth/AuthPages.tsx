import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button, Field, DemoNote } from "@/components/common";
import { onboardingRepository } from "@/services/api/onboardingRepository";
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      <aside className="auth-art">
        <Link className="brand" to="/login">
          <GraduationCap size={32} /> TeacherCopilot AI
        </Link>
        <div className="auth-art-content">
          <span className="eyebrow">MATEMATIKA USTOZLARI UCHUN</span>
          <h1>
            G‘oyadan
            <br />
            tayyor darsgacha.
          </h1>
          <p>
            Matematik darslar, yechimli misollar va testlarni bir joyda
            tayyorlang. Diqqatingizni o‘qitishga qarating.
          </p>
          <div className="auth-illustration">
            <BookOpen size={90} />
            <Sparkles size={42} />
          </div>
        </div>
        <small>Matematika, algebra va geometriya uchun ish maydoni</small>
      </aside>
      <main className="auth-main">
        <div className="auth-form-wrap">{children}</div>
      </main>
    </div>
  );
}
export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  return (
    <AuthShell>
      <h1>Xush kelibsiz, ustoz</h1>
      <p>Matematika ustozining shaxsiy ish maydoniga kiring.</p>
      <DemoNote>
        Mahalliy prototip: faqat avval ro‘yxatdan o‘tgan profil ochiladi.
        Xavfsiz server autentifikatsiyasi hali ulanmagan; parol tekshirilmaydi
        va saqlanmaydi.
      </DemoNote>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            onboardingRepository.loginLocalProfile(email, "teacher", remember);
            navigate("/teacher");
          } catch (e) {
            toast.error((e as Error).message);
          }
        }}
      >
        <Field label="Elektron pochta">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Parol">
          <input
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <label className="check-label">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />{" "}
          Meni eslab qolish
        </label>
        <Button className="full">
          Kirish <ArrowRight size={16} />
        </Button>
      </form>
      <p>
        Hisobingiz yo‘qmi?{" "}
        <Link className="text-link" to="/register/teacher">
          Ro‘yxatdan o‘tish
        </Link>
      </p>
      <Link to="/forgot-password">Parolni unutdingizmi?</Link>
    </AuthShell>
  );
}
export function ForgotPassword() {
  return (
    <AuthShell>
      <h1>Parolni tiklash</h1>
      <DemoNote>
        Parolni email orqali tiklash uchun server xizmati hali ulanmagan. Avval
        yaratilgan mahalliy profilingiz bilan kirish sahifasidan foydalaning.
      </DemoNote>
      <Button asChild>
        <Link to="/login">Kirishga qaytish</Link>
      </Button>
    </AuthShell>
  );
}
