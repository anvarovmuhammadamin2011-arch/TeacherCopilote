import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, type FieldPath } from "react-hook-form";
import {
  GraduationCap,
  User,
  School,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ArrowLeft,
  ArrowRight,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Save,
  ShieldCheck,
  CheckCircle2,
  Pencil,
  Upload,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRegistration } from "@/stores/useRegistration";
import { useAuth } from "@/stores/useAuth";
import { useStore } from "@/stores/useStore";
import { useTheme } from "@/hooks/useTheme";
import type { RegistrationDraft } from "@/types";
import {
  personalSchema,
  professionalSchema,
  classesSchema,
  employmentSchema,
  newClass,
  teachingSubjects,
  regions,
  schoolTypes,
  experienceOptions,
  educationOptions,
  languageOptions,
  emptyDraft,
} from "./schema";
import { SearchSelect } from "./SearchSelect";
import {
  onboardingRepository,
  addClassAssignment,
} from "@/services/api/onboardingRepository";
import {
  Button,
  Field,
  Badge,
  Card,
  Confirm,
  DemoNote,
  Progress,
  SearchInput,
} from "@/components/common";
import { uid } from "@/utils/cn";
const steps = [
  { title: "Shaxsiy ma’lumotlar", sub: "Siz bilan tanishamiz", icon: User },
  {
    title: "Kasbiy ma’lumotlar",
    sub: "Tajriba va bilimlaringiz",
    icon: School,
  },
  {
    title: "Sinflaringizni qo‘shing",
    sub: "Yangi o‘quv maydonlari",
    icon: BookOpen,
  },
  {
    title: "Ish faoliyati",
    sub: "Sizga mos ish jadvali",
    icon: BriefcaseBusiness,
  },
  {
    title: "Ma’lumotlarni tasdiqlash",
    sub: "Hammasini bir tekshiramiz",
    icon: Check,
  },
];
type Form = RegistrationDraft & {
  password: string;
  confirmation: string;
  salary: string;
};
export function TeacherRegistration() {
  useTheme();
  const navigate = useNavigate();
  const draft = useRegistration((s) => s.draft);
  const update = useRegistration((s) => s.update);
  const clear = useRegistration((s) => s.clear);
  const [params] = useSearchParams();
  const edit = params.get("edit") === "1";
  const db = useStore((s) => s.db);
  const existing = db.teacherProfiles.find((p) => p.id === db.teacher.id);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [subjectQuery, setSubjectQuery] = useState("");
  const {
    register,
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<Form>({
    defaultValues: { ...draft, password: "", confirmation: "", salary: "" },
    shouldUnregister: false,
  });
  const values = watch();
  const step = draft.step;
  const classHours = values.classes.reduce(
    (s, c) => s + (Number(c.weeklyHours) || 0),
    0,
  );
  useEffect(() => {
    if (edit && existing) {
      reset({
        ...emptyDraft(),
        personal: {
          firstName: existing.firstName,
          lastName: existing.lastName,
          middleName: existing.middleName,
          email: existing.email,
          phone: existing.phone,
          avatar: existing.avatar,
        },
        professional: existing.professional,
        employment: existing.employment,
        classes: [],
        password: "",
        confirmation: "",
        salary: "",
      });
      update({ step: 1 });
    }
  }, []);
  useEffect(() => {
    const sub = watch(() => {
      const v = getValues();
      update({
        personal: {
          firstName: v.personal.firstName,
          lastName: v.personal.lastName,
          middleName: v.personal.middleName,
          email: v.personal.email,
          phone: v.personal.phone,
          avatar: v.personal.avatar,
        },
        professional: v.professional,
        classes: v.classes,
        employment: {
          type: v.employment.type,
          weeklyHours: Number(v.employment.weeklyHours) || 0,
          workSchedule: v.employment.workSchedule,
          startDate: v.employment.startDate,
          currency: "UZS",
        },
      });
    });
    return () => sub.unsubscribe();
  }, [watch, getValues, update]);
  const validate = (index: number) => {
    clearErrors();
    const v = getValues();
    const result =
      index === 0
        ? personalSchema.safeParse({
            ...v.personal,
            password: v.password,
            confirmation: v.confirmation,
          })
        : index === 1
          ? professionalSchema.safeParse(v.professional)
          : index === 2
            ? classesSchema.safeParse(v.classes)
            : employmentSchema.safeParse(v.employment);
    if (!result.success) {
      for (const error of result.error.issues) {
        const path =
          index === 0
            ? error.path[0] === "password" || error.path[0] === "confirmation"
              ? String(error.path[0])
              : "personal." + error.path.join(".")
            : ["", "professional", "classes", "employment"][index] +
              "." +
              error.path.join(".");
        setError(path as FieldPath<Form>, { message: error.message });
      }
      toast.error(result.error.issues[0]?.message || "Maydonlarni tekshiring.");
      return false;
    }
    return true;
  };
  const next = () => {
    if (
      step === 3 &&
      getValues().salary &&
      (Number(getValues().salary) < 0 ||
        !Number.isFinite(Number(getValues().salary)))
    ) {
      setError("salary", { message: "Musbat son kiriting." });
      toast.error("Maosh manfiy bo‘lishi mumkin emas.");
      return;
    }
    if ((edit && step === 0) || validate(step))
      update({ step: Math.min(step + 1, 4) });
  };
  const complete = async () => {
    const v = getValues();
    if (edit) {
      if (
        !v.personal.firstName.trim() ||
        !v.personal.lastName.trim() ||
        !v.personal.email.includes("@") ||
        !classesSchema.safeParse(v.classes).success
      ) {
        toast.error("Ism, email va sinf ma’lumotlarini tekshiring.");
        return;
      }
      if (
        !professionalSchema.safeParse(v.professional).success ||
        !employmentSchema.safeParse(v.employment).success
      ) {
        toast.error("Kasbiy va ish ma’lumotlarini tekshiring.");
        return;
      }
      useStore.getState().mutate((d) => {
        const p = d.teacherProfiles.find((p) => p.id === d.teacher.id);
        if (p) {
          p.professional = v.professional;
          p.employment = v.employment;
          p.school = v.professional.school.name;
          p.subject = v.professional.primarySubject;
          p.experience = v.professional.experienceRange;
          p.firstName = v.personal.firstName;
          p.lastName = v.personal.lastName;
          p.middleName = v.personal.middleName;
          p.email = v.personal.email;
          p.phone = v.personal.phone;
          p.avatar = v.personal.avatar;
          Object.assign(d.teacher, {
            firstName: p.firstName,
            lastName: p.lastName,
            email: p.email,
            avatar: p.avatar,
            school: p.school,
            subject: p.subject,
            experience: p.experience,
          });
          v.classes.forEach((row) =>
            addClassAssignment(d, row, p.id, p.school),
          );
        }
      });
      clear();
      navigate("/teacher/profile");
      toast.success("Demo kasbiy ma’lumotlar yangilandi");
      return;
    }
    for (let i = 0; i < 4; i++)
      if (!validate(i)) {
        update({ step: i });
        return;
      }
    setBusy(true);
    try {
      const result = await onboardingRepository.completeTeacher(
        v,
        v.password,
        v.confirmation,
      );
      clear();
      reset({ ...emptyDraft(), password: "", confirmation: "", salary: "" });
      useAuth.getState().createSession(
        {
          id: result.profile.id,
          name: result.profile.firstName + " " + result.profile.lastName,
          email: result.profile.email,
          role: "teacher",
          isDemo: true,
        },
        true,
        "/register/success",
      );
      navigate("/register/success", {
        state: {
          classCount: result.classCount,
          assignmentCount: result.assignmentCount,
        },
      });
      toast.success("Demo o‘qituvchi profilingiz tayyor");
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Demo profil yaratilmadi. Qayta urinib ko‘ring.",
      );
    } finally {
      setBusy(false);
    }
  };
  const fieldError = (name: "firstName" | "lastName" | "email" | "phone") =>
    errors.personal?.[name]?.message;
  const setClass = (
    index: number,
    key: keyof RegistrationDraft["classes"][number],
    value: string | number,
  ) =>
    setValue(`classes.${index}.${key}` as FieldPath<Form>, value, {
      shouldDirty: true,
    });
  return (
    <div className="onboarding-shell">
      <aside className="onboarding-aside">
        <Link to="/login" className="brand">
          <span className="brand-symbol">
            <GraduationCap size={26} />
          </span>
          <span className="brand-text">
            TeacherCopilot <span>AI</span>
            <small>USTOZNING YANGI ISH MAYDONI</small>
          </span>
        </Link>
        <div className="onboarding-aside-inner">
          <Badge>Ustozning ish maydoni</Badge>
          <h2>
            Yaxshi darslar
            <br />
            sizdan boshlanadi.
          </h2>
          <p>Ish maydoningizni bir necha qadamda o‘zingizga moslang.</p>
          <ol className="onboarding-steps">
            {steps.map((s, i) => (
              <li
                className={
                  (i === step ? "current " : "") + (i < step ? "complete" : "")
                }
                key={s.title}
              >
                <button
                  type="button"
                  disabled={i > step}
                  onClick={() => update({ step: i })}
                  aria-current={i === step ? "step" : undefined}
                >
                  <span>{i < step ? <Check size={17} /> : i + 1}</span>
                  <div>
                    <b>{s.title}</b>
                    <small>{s.sub}</small>
                  </div>
                </button>
              </li>
            ))}
          </ol>
          <div className="onboarding-security">
            <ShieldCheck size={20} />
            <div>
              <b>Erkin sinab ko‘ring</b>
              <p>
                Faqat xayoliy demo ma’lumotlardan foydalaning. Haqiqiy hisob
                yaratish tizimi hali ulanmagan.
              </p>
            </div>
          </div>
        </div>
        <footer>© 2026 TeacherCopilot AI</footer>
      </aside>
      <main className="onboarding-main">
        <header>
          <Link className="back-link" to={edit ? "/teacher/profile" : "/login"}>
            <ArrowLeft size={15} />
            {edit ? "Profilga qaytish" : "Kirish sahifasi"}
          </Link>
          <span>
            <Save size={13} />
            Qoralama saqlanadi
          </span>
        </header>
        <div className="onboarding-content">
          <div className="onboarding-mobile-progress">
            <Progress value={((step + 1) / 5) * 100} />
          </div>
          <div className="onboarding-step-label">
            {step + 1}-QADAM <span>/ 5</span>
          </div>
          <h1>{steps[step].title}</h1>
          <p className="onboarding-description">
            {
              [
                "Avvalo, siz bilan tanishib olaylik.",
                "O‘qituvchilik faoliyatingiz haqida ma’lumot bering.",
                "Qaysi sinflarga dars berishingizni belgilang.",
                "Ish jadvalingiz va faoliyatingiz haqida ma’lumotlar.",
                "Barchasi to‘g‘rimi? Ma’lumotlarni bir ko‘zdan kechiring.",
              ][step]
            }
          </p>
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <form
              id="registration-step"
              onSubmit={(e) => {
                e.preventDefault();
                if (step === 4) void complete();
                else next();
              }}
              noValidate
            >
              {step === 0 && (
                <>
                  <label className="onboarding-avatar">
                    {values.personal.avatar ? (
                      <img alt="Profil rasmi" src={values.personal.avatar} />
                    ) : (
                      <span>
                        <User size={30} />
                      </span>
                    )}
                    <div>
                      <b>Profil rasmini qo‘shing</b>
                      <small>Ixtiyoriy · PNG yoki JPG, 1 MB gacha</small>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          if (f.size > 1024 * 1024) {
                            toast.error("1 MB dan kichik rasmni tanlang.");
                            return;
                          }
                          const r = new FileReader();
                          r.onload = () =>
                            setValue("personal.avatar", String(r.result));
                          r.readAsDataURL(f);
                        }}
                      />
                    </div>
                    <Upload size={17} />
                  </label>
                  <div className="form-grid">
                    <Field label="Ism *" error={fieldError("firstName")}>
                      <input
                        autoComplete="given-name"
                        placeholder="Masalan, Aziz"
                        {...register("personal.firstName")}
                      />
                    </Field>
                    <Field label="Familiya *" error={fieldError("lastName")}>
                      <input
                        autoComplete="family-name"
                        placeholder="Karimov"
                        {...register("personal.lastName")}
                      />
                    </Field>
                    <Field label="Otasining ismi">
                      <input
                        placeholder="Ixtiyoriy"
                        {...register("personal.middleName")}
                      />
                    </Field>
                    <Field label="Telefon raqami" error={fieldError("phone")}>
                      <input
                        type="tel"
                        autoComplete="tel"
                        placeholder="+998 __ ___ __ __"
                        {...register("personal.phone")}
                      />
                    </Field>
                  </div>
                  <Field label="Elektron pochta *" error={fieldError("email")}>
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="ustoz@example.uz"
                      {...register("personal.email")}
                    />
                  </Field>
                  <div className="form-grid">
                    <Field label="Parol *" error={errors.password?.message}>
                      <div className="password-input">
                        <input
                          type={visible ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Kamida 8 ta belgi"
                          name="password"
                          value={values.password}
                          onChange={(e) =>
                            setValue("password", e.target.value, {
                              shouldDirty: true,
                            })
                          }
                        />
                        <button
                          type="button"
                          aria-label={
                            visible ? "Parolni yashirish" : "Parolni ko‘rsatish"
                          }
                          onClick={() => setVisible((v) => !v)}
                        >
                          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </Field>
                    <Field
                      label="Parolni tasdiqlang *"
                      error={errors.confirmation?.message}
                    >
                      <input
                        type={visible ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Parolni qayta kiriting"
                        name="confirmation"
                        value={values.confirmation}
                        onChange={(e) =>
                          setValue("confirmation", e.target.value, {
                            shouldDirty: true,
                          })
                        }
                      />
                    </Field>
                  </div>
                  <div className="onboarding-notice">
                    <ShieldCheck size={18} />
                    <p>
                      Demo rejimi: haqiqiy xavfsiz hisob yaratilmaydi. Parollar
                      saqlanmaydi va serverga yuborilmaydi. Sahifa yangilansa,
                      parolni qayta kiritasiz.
                    </p>
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <h3 className="form-section-title">
                    <School size={17} />
                    Maktab haqida
                  </h3>
                  <Field
                    label="Maktab nomi *"
                    error={errors.professional?.school?.name?.message}
                  >
                    <input
                      placeholder="Masalan, 12-sonli maktab"
                      {...register("professional.school.name")}
                    />
                  </Field>
                  <div className="form-grid">
                    <SearchSelect
                      label="Maktab turi *"
                      value={values.professional.school.type}
                      options={schoolTypes}
                      onChange={(v) => setValue("professional.school.type", v)}
                    />
                    <SearchSelect
                      label="Hudud *"
                      value={values.professional.school.region}
                      options={regions}
                      onChange={(v) =>
                        setValue("professional.school.region", v)
                      }
                    />
                  </div>
                  <Field
                    label="Tuman yoki shahar *"
                    error={errors.professional?.school?.district?.message}
                  >
                    <input
                      placeholder="Masalan, Baliqchi tumani"
                      {...register("professional.school.district")}
                    />
                  </Field>
                  <h3 className="form-section-title">
                    <BookOpen size={17} />
                    Dars berish faoliyati
                  </h3>
                  <SearchSelect
                    label="Asosiy fan *"
                    value={values.professional.primarySubject}
                    options={teachingSubjects}
                    onChange={(v) => setValue("professional.primarySubject", v)}
                  />
                  <div className="field">
                    <span>Qo‘shimcha fanlar</span>
                    <SearchInput
                      value={subjectQuery}
                      onChange={setSubjectQuery}
                      placeholder="Fanni qidiring…"
                    />
                    <div className="subject-chips">
                      {[
                        ...new Set(
                          [
                            ...teachingSubjects,
                            ...values.professional.additionalSubjects,
                          ].filter(Boolean),
                        ),
                      ]
                        .filter(
                          (s) =>
                            s !== values.professional.primarySubject &&
                            s
                              .toLowerCase()
                              .includes(subjectQuery.toLowerCase()),
                        )
                        .slice(0, 12)
                        .map((s) => (
                          <button
                            type="button"
                            key={s}
                            aria-pressed={values.professional.additionalSubjects.includes(
                              s,
                            )}
                            className={
                              values.professional.additionalSubjects.includes(s)
                                ? "selected"
                                : ""
                            }
                            onClick={() =>
                              setValue(
                                "professional.additionalSubjects",
                                values.professional.additionalSubjects.includes(
                                  s,
                                )
                                  ? values.professional.additionalSubjects.filter(
                                      (x) => x !== s,
                                    )
                                  : [
                                      ...values.professional.additionalSubjects,
                                      s,
                                    ],
                              )
                            }
                          >
                            {values.professional.additionalSubjects.includes(
                              s,
                            ) ? (
                              <Check size={12} />
                            ) : (
                              <Plus size={12} />
                            )}{" "}
                            {s}
                          </button>
                        ))}
                    </div>
                    <small className="muted">
                      Matematika yoki ingliz tili yo‘nalishlarini tanlashingiz
                      mumkin.
                    </small>
                  </div>
                  <div className="form-grid">
                    <SearchSelect
                      label="Ish tajribasi *"
                      value={values.professional.experienceRange}
                      options={experienceOptions}
                      onChange={(v) =>
                        setValue("professional.experienceRange", v)
                      }
                    />
                    <SearchSelect
                      label="Ma’lumot darajasi *"
                      value={values.professional.education}
                      options={educationOptions}
                      onChange={(v) => setValue("professional.education", v)}
                    />
                  </div>
                  <div className="field">
                    <span>Dars o‘tish tili *</span>
                    <div className="language-choices">
                      {languageOptions.map((l) => (
                        <label key={l}>
                          <input
                            type="checkbox"
                            checked={values.professional.languages.includes(l)}
                            onChange={(e) =>
                              setValue(
                                "professional.languages",
                                e.target.checked
                                  ? [...values.professional.languages, l]
                                  : values.professional.languages.filter(
                                      (x) => x !== l,
                                    ),
                              )
                            }
                          />
                          {l}
                        </label>
                      ))}
                    </div>
                    {errors.professional?.languages && (
                      <small className="error-text">
                        {errors.professional.languages.message}
                      </small>
                    )}
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="onboarding-notice">
                    <BookOpen size={18} />
                    <p>
                      Bir sinfga bir nechta fan biriktirish mumkin. Har bir fan
                      uchun alohida yozuv qo‘shing. Sinflar soni va haftalik
                      soatlar rejalashtirishda ishlatiladi.
                    </p>
                  </div>
                  <div className="dynamic-classes">
                    {values.classes.map((c, i) => (
                      <Card key={c.id} className="class-entry">
                        <div className="class-entry-head">
                          <span>
                            <School size={16} />
                            {i + 1}-fan biriktirish
                          </span>
                          <div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`${i + 1}-sinf yozuvini nusxalash`}
                              onClick={() =>
                                setValue("classes", [
                                  ...values.classes,
                                  { ...c, id: uid() },
                                ])
                              }
                            >
                              <Copy size={15} />
                            </Button>
                            <Confirm
                              title="Sinf yozuvi olib tashlansinmi?"
                              description="Faqat ro‘yxatdan o‘tish qoralamasidagi yozuv o‘chadi."
                              onConfirm={() =>
                                setValue(
                                  "classes",
                                  values.classes.filter((x) => x.id !== c.id),
                                )
                              }
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`${i + 1}-sinf yozuvini o‘chirish`}
                              >
                                <Trash2 size={15} />
                              </Button>
                            </Confirm>
                          </div>
                        </div>
                        <div className="form-grid">
                          <Field
                            label="Sinf nomi *"
                            error={errors.classes?.[i]?.name?.message}
                          >
                            <input
                              value={c.name}
                              placeholder="Masalan, 8-A"
                              onChange={(e) =>
                                setClass(i, "name", e.target.value)
                              }
                            />
                          </Field>
                          <Field
                            label="Fan *"
                            error={errors.classes?.[i]?.subject?.message}
                          >
                            <select
                              value={c.subject}
                              onChange={(e) =>
                                setClass(i, "subject", e.target.value)
                              }
                            >
                              {teachingSubjects.map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                          </Field>
                          <Field label="Bosqich">
                            <select
                              value={c.grade}
                              onChange={(e) =>
                                setClass(i, "grade", Number(e.target.value))
                              }
                            >
                              {Array.from({ length: 11 }, (_, n) => (
                                <option key={n} value={n + 1}>
                                  {n + 1}-sinf
                                </option>
                              ))}
                            </select>
                          </Field>
                          <Field label="Sinf harfi">
                            <input
                              maxLength={5}
                              value={c.section}
                              onChange={(e) =>
                                setClass(i, "section", e.target.value)
                              }
                            />
                          </Field>
                          <Field
                            label="O‘quv yili"
                            error={errors.classes?.[i]?.year?.message}
                          >
                            <input
                              value={c.year}
                              onChange={(e) =>
                                setClass(i, "year", e.target.value)
                              }
                            />
                          </Field>
                          <Field label="Haftalik dars soatlari">
                            <input
                              type="number"
                              min={1}
                              max={40}
                              value={c.weeklyHours}
                              onChange={(e) =>
                                setClass(
                                  i,
                                  "weeklyHours",
                                  Number(e.target.value),
                                )
                              }
                            />
                          </Field>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <datalist id="onboarding-subjects">
                    {[
                      ...new Set([
                        values.professional.primarySubject,
                        ...values.professional.additionalSubjects,
                        ...teachingSubjects,
                      ]),
                    ].map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                  <Button
                    variant="outline"
                    type="button"
                    className="add-class-row"
                    disabled={values.classes.length >= 30}
                    onClick={() =>
                      setValue("classes", [
                        ...values.classes,
                        newClass(values.professional.primarySubject),
                      ])
                    }
                  >
                    <Plus size={17} />
                    Sinf qo‘shish
                  </Button>
                  <div className="onboarding-class-summary">
                    <span>
                      Jami sinflar:{" "}
                      <b>
                        {
                          new Set(
                            values.classes.map(
                              (c) => c.name.trim().toLowerCase() + "|" + c.year,
                            ),
                          ).size
                        }
                      </b>
                    </span>
                    <span>
                      Jami haftalik dars soatlari: <b>{classHours}</b>
                    </span>
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <div className="form-grid">
                    <SearchSelect
                      label="Bandlik turi"
                      value={values.employment.type}
                      options={[
                        "To‘liq stavka",
                        "Yarim stavka",
                        "Soatbay",
                        "Boshqa",
                      ]}
                      onChange={(v) => setValue("employment.type", v)}
                    />
                    <Field label="Haftalik ish soatlari">
                      <input
                        type="number"
                        min={0}
                        max={80}
                        {...register("employment.weeklyHours", {
                          valueAsNumber: true,
                        })}
                      />
                    </Field>
                  </div>
                  <Field label="Ish jadvali">
                    <textarea
                      rows={3}
                      placeholder="Masalan, dushanba–juma 08:00–14:00"
                      {...register("employment.workSchedule")}
                    />
                  </Field>
                  <Field label="Ish boshlagan sana">
                    <input type="date" {...register("employment.startDate")} />
                  </Field>
                  <div className="private-salary">
                    <h3>
                      <ShieldCheck size={17} />
                      Oylik maosh · ixtiyoriy
                    </h3>
                    <p>
                      Bu maydon faqat shu shaklda sizga ko‘rsatiladi. Demo
                      rejimida maosh saqlanmaydi, statistikaga yoki AI
                      xizmatlariga berilmaydi.
                    </p>
                    <div className="form-grid">
                      <Field label="Oylik maosh" error={errors.salary?.message}>
                        <input
                          type="number"
                          min={0}
                          placeholder="Kiritmasangiz ham bo‘ladi"
                          {...register("salary")}
                        />
                      </Field>
                      <Field label="Valyuta">
                        <input value="UZS" readOnly />
                      </Field>
                    </div>
                    <small>
                      Xavfsiz va maxfiy server saqlashi backend ulangandan keyin
                      qo‘shiladi.
                    </small>
                  </div>
                </>
              )}
              {step === 4 && (
                <div className="registration-review">
                  {[
                    {
                      title: "Shaxsiy ma’lumotlar",
                      step: 0,
                      rows: [
                        [
                          "Ism va familiya",
                          values.personal.firstName +
                            " " +
                            values.personal.lastName,
                        ],
                        ["Elektron pochta", values.personal.email],
                        ["Telefon", values.personal.phone || "Kiritilmagan"],
                      ],
                    },
                    {
                      title: "Maktab va kasbiy faoliyat",
                      step: 1,
                      rows: [
                        ["Maktab", values.professional.school.name],
                        [
                          "Hudud",
                          values.professional.school.region +
                            ", " +
                            values.professional.school.district,
                        ],
                        [
                          "Fanlar",
                          [
                            values.professional.primarySubject,
                            ...values.professional.additionalSubjects,
                          ].join(", "),
                        ],
                        [
                          "Tajriba va ma’lumot",
                          values.professional.experienceRange +
                            " · " +
                            values.professional.education,
                        ],
                        ["Dars tili", values.professional.languages.join(", ")],
                      ],
                    },
                    {
                      title: "Sinflar va fanlar",
                      step: 2,
                      rows: values.classes.length
                        ? values.classes.map((c) => [
                            c.name + " · " + c.subject,
                            `${c.weeklyHours} soat / hafta`,
                          ])
                        : [["Sinflar", "Keyinroq qo‘shiladi"]],
                    },
                    {
                      title: "Ish faoliyati",
                      step: 3,
                      rows: [
                        ["Bandlik", values.employment.type],
                        [
                          "Haftalik soatlar",
                          String(values.employment.weeklyHours),
                        ],
                        [
                          "Jadval",
                          values.employment.workSchedule || "Belgilanmagan",
                        ],
                        ["Maosh", "Saqlanmaydi · vaqtinchalik maydon"],
                      ],
                    },
                  ].map((section) => (
                    <Card key={section.title}>
                      <div className="card-head">
                        <h2>{section.title}</h2>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => update({ step: section.step })}
                        >
                          <Pencil size={13} />
                          Tahrirlash
                        </Button>
                      </div>
                      <dl>
                        {section.rows.map(([label, value]) => (
                          <div key={label}>
                            <dt>{label}</dt>
                            <dd>{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </Card>
                  ))}
                  <div className="onboarding-notice">
                    <ShieldCheck size={19} />
                    <p>
                      Haqiqiy xavfsiz hisob yaratilmaydi. Faqat demo profil,
                      sinflar va fan biriktirishlari shu brauzerga saqlanadi.
                      Parollar va maosh yozilmaydi.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </motion.div>
          <div className="onboarding-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                step ? update({ step: step - 1 }) : navigate("/register")
              }
            >
              <ArrowLeft size={15} />
              Orqaga
            </Button>
            {(step === 2 || step === 3) && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (step === 2) setValue("classes", []);
                  else {
                    setValue("employment", emptyDraft().employment);
                    setValue("salary", "");
                  }
                  update({ step: step + 1 });
                }}
              >
                Keyinroq to‘ldirish
              </Button>
            )}
            <Button type="submit" form="registration-step" disabled={busy}>
              {busy
                ? "Tayyorlanmoqda…"
                : step === 4
                  ? edit
                    ? "O‘zgarishlarni saqlash"
                    : "Ro‘yxatdan o‘tishni yakunlash"
                  : "Davom etish"}
              {step === 4 ? <Check size={16} /> : <ArrowRight size={16} />}
            </Button>
          </div>
          <footer className="onboarding-bottom">
            <span>
              <Save size={12} />
              Parol va maosh qoralamaga kiritilmaydi
            </span>
            <Confirm
              title="Ro‘yxatdan o‘tish qoralamasi tozalansinmi?"
              description="Faqat bu shakldagi qoralama o‘chadi. Kabinetdagi ma’lumotlar saqlanadi."
              onConfirm={() => {
                clear();
                reset({
                  ...emptyDraft(),
                  password: "",
                  confirmation: "",
                  salary: "",
                });
              }}
            >
              <button type="button">Qoralamani tozalash</button>
            </Confirm>
          </footer>
        </div>
      </main>
    </div>
  );
}
export function RegistrationSuccess() {
  useTheme();
  useEffect(() => {
    useAuth.setState({ postLoginPath: null });
  }, []);
  const db = useStore((s) => s.db);
  const profile = db.teacher;
  const count = new Set(
    db.teacherClassAssignments
      .filter((a) => a.teacherId === profile.id && !a.archived)
      .map((a) => a.classId),
  ).size;
  return (
    <div className="registration-success">
      <Link className="brand" to="/teacher">
        <span className="brand-symbol">
          <GraduationCap size={26} />
        </span>
        <span className="brand-text">
          TeacherCopilot <span>AI</span>
        </span>
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="success-card"
      >
        <span className="success-icon">
          <CheckCircle2 size={44} />
        </span>
        <Badge tone="green">Demo ish maydoni tayyor</Badge>
        <h1>Xush kelibsiz, ustoz!</h1>
        <p>
          {profile.firstName} {profile.lastName}, endi darslaringiz uchun yangi
          imkoniyatlar ochiq.
        </p>
        <div className="success-summary">
          <div>
            <School size={22} />
            <strong>{count}</strong>
            <span>ta sinf</span>
          </div>
          <div>
            <BookOpen size={22} />
            <strong>{profile.subject}</strong>
            <span>asosiy fan</span>
          </div>
        </div>
        <Button asChild className="full">
          <Link to="/teacher">
            Boshqaruv paneliga o‘tish
            <ArrowRight size={16} />
          </Link>
        </Button>
        <Button asChild variant="outline" className="full">
          <Link to="/teacher/classes">
            Sinflarimni boshqarish
            <ChevronRight size={16} />
          </Link>
        </Button>
        <DemoNote>
          Haqiqiy autentifikatsiya ulanmagan. Ma’lumotlar demo xotirada
          saqlangan.
        </DemoNote>
      </motion.div>
    </div>
  );
}
