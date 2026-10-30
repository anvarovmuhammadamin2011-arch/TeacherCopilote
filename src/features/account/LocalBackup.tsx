import { useState } from "react";
import { Button, Field, Confirm } from "@/components/common";
import { useStore } from "@/stores/useStore";
import { upgradeDatabase } from "@/data/upgrade";
import { downloadBlob } from "@/utils/export";
import { toast } from "sonner";
import type { Database } from "@/types";
export default function LocalBackup() {
  const db = useStore((s) => s.db);
  const [pending, setPending] = useState<Database | null>(null);
  const [error, setError] = useState("");
  return (
    <section className="local-backup">
      <h2>Saqlash va zaxira nusxa</h2>
      <p>
        Materiallar shu brauzerda, tanlangan profilga ajratib saqlanadi. Bu
        bulutli hisob emas: boshqa qurilmaga avtomatik sinxronlash hali
        ulanmagan.
      </p>
      <Button
        variant="outline"
        onClick={() => {
          const { teacherProfiles: _profiles, ...records } = db;
          downloadBlob(
            "TeacherCopilot-zaxira.json",
            new Blob(
              [
                JSON.stringify(
                  {
                    format: "teachercopilot-backup-v1",
                    owner: { id: db.teacher.id, email: db.teacher.email },
                    db: { ...records, teacherProfiles: [] },
                  },
                  null,
                  2,
                ),
              ],
              { type: "application/json" },
            ),
          );
        }}
      >
        Zaxira nusxani yuklab olish
      </Button>
      <Field label="Zaxira nusxadan tiklash">
        <input
          type="file"
          accept=".json,application/json"
          onChange={async (e) => {
            setPending(null);
            setError("");
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              if (f.size > 10 * 1024 * 1024)
                throw new Error("Fayl 10 MB dan kichik bo‘lsin.");
              const raw = JSON.parse(await f.text());
              if (
                raw.format !== "teachercopilot-backup-v1" ||
                !raw.db ||
                !Array.isArray(raw.db.documents) ||
                !Array.isArray(raw.db.lessons) ||
                !Array.isArray(raw.db.quizzes)
              )
                throw new Error("TeacherCopilot zaxira faylini tanlang.");
              if (
                raw.owner?.id !== db.teacher.id &&
                raw.owner?.email?.toLowerCase() !==
                  db.teacher.email.toLowerCase()
              )
                throw new Error("Bu nusxa boshqa profilga tegishli.");
              setPending(upgradeDatabase(raw.db));
            } catch (e) {
              setError(e instanceof Error ? e.message : "Nusxa o‘qilmadi.");
            }
          }}
        />
      </Field>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      {pending && (
        <div>
          <p>
            {pending.lessons.length} reja, {pending.quizzes.length} test,{" "}
            {pending.documents.length} hujjat. Joriy ish maydoni almashadi.
            Avval joriy nusxani yuklab oling.
          </p>
          <Confirm
            title="Zaxira nusxadan tiklansinmi?"
            description="Joriy hujjatlar, sinflar va jadval nusxadagi holatga almashadi. Profilingiz o‘zgarmaydi."
            onConfirm={() => {
              try {
                useStore.getState().mutate((d) => {
                  const {
                    teacher: _teacher,
                    teacherProfiles: _profiles,
                    ...records
                  } = pending;
                  Object.assign(d, records);
                  d.teacherClassAssignments = d.teacherClassAssignments.map(
                    (a) => ({ ...a, teacherId: d.teacher.id! }),
                  );
                });
                setPending(null);
                toast.success("Zaxira nusxa tiklandi");
              } catch {
                toast.error("Tiklanmadi. Joriy ma’lumotlar o‘zgarmadi.");
              }
            }}
          >
            <Button>Nusxani tiklash</Button>
          </Confirm>
        </div>
      )}
    </section>
  );
}
