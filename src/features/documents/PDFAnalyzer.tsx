import { useState } from "react";
import { FileSearch, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { PageHead, Card, Button, Field, DemoNote } from "@/components/common";
import { useStore } from "@/stores/useStore";
import { uid, today } from "@/utils/cn";
export default function PDFAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [task, setTask] = useState("Qisqa xulosa");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <>
      <PageHead
        title="PDF tahlil"
        description="Matematika darsliklari, masalalar to‘plami va metodik materiallar uchun."
      />
      <DemoNote>
        Frontend namoyishi. PDF matni o‘qilmaydi va AI tahlili bajarilmaydi.
        Fayl serverga yuborilmaydi; faqat o‘zingiz saqlagan kartochka
        metama’lumotlari brauzerda qoladi.
      </DemoNote>
      <div className="two-col">
        <Card>
          <label className="upload-zone">
            <Upload size={30} />
            <strong>{file?.name || "PDF fayl tanlang"}</strong>
            <span>PDF · 20 MB gacha</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (
                  !f.name.toLowerCase().endsWith(".pdf") ||
                  f.size > 20 * 1024 * 1024
                ) {
                  toast.error("20 MB dan kichik PDF tanlang.");
                  return;
                }
                setFile(f);
                setResult(false);
                setSaved(false);
              }}
            />
          </label>
          <Field label="Nima tayyorlaymiz?">
            <select
              value={task}
              onChange={(e) => {
                setTask(e.target.value);
                setResult(false);
              }}
            >
              {[
                "Qisqa xulosa",
                "Mavzuni tushuntirish",
                "Test savollari",
                "Dars rejasi",
                "Uy vazifasi",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Qo‘shimcha ko‘rsatma">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </Field>
          <Button disabled={!file} onClick={() => setResult(true)}>
            <FileSearch size={16} />
            Namoyish oynasini ochish
          </Button>
        </Card>
        <Card>
          <h2>{result ? task : "Tahlil uchun tayyor"}</h2>
          <p>
            {result
              ? `«${file?.name}» uchun “${task}” so‘rovi tanlandi. Haqiqiy natija xavfsiz AI integratsiyasidan keyin shu yerda ko‘rinadi.`
              : "Fayl va kerakli natija turini tanlang."}
          </p>
          {result && (
            <>
              <DemoNote>
                Bu fayl mazmunidan olingan xulosa emas. Hozir tayyor material
                yaratish uchun AI vositalaridan foydalanishingiz mumkin.
              </DemoNote>
              <Button asChild variant="outline">
                <Link
                  to={
                    task === "Test savollari"
                      ? "/teacher/quizzes/create"
                      : task === "Uy vazifasi"
                        ? "/teacher/homework"
                        : task === "Dars rejasi"
                          ? "/teacher/lessons/create"
                          : "/teacher/conspects"
                  }
                >
                  Mos AI vositasiga o‘tish
                </Link>
              </Button>
              <Button
                disabled={saved}
                onClick={() => {
                  if (!file) return;
                  useStore.getState().mutate((d) =>
                    d.materials.unshift({
                      id: uid(),
                      title: file.name,
                      category: "PDF",
                      size: (file.size / 1024).toFixed(1) + " KB",
                      date: today(),
                      favorite: false,
                      folder: "PDF materiallar",
                      content:
                        "PDF fayl kartochkasi. Faylning o‘zi saqlanmagan va tahlil qilinmagan.",
                    }),
                  );
                  setSaved(true);
                  toast.success("PDF kartochkasi saqlandi");
                }}
              >
                Kutubxonaga kartochka saqlash
              </Button>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
