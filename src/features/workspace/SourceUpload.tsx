import { useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button, Field } from "@/components/common";
import { mathTopics } from "@/features/mathematics/curriculum";
import { usePreparation } from "@/stores/usePreparation";
export default function SourceUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const job = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  const suggestions = mathTopics
    .filter((t) => t.pattern.test(text.toLowerCase()))
    .slice(0, 4);
  async function read() {
    if (!file) return;
    const run = ++job.current;
    setBusy(true);
    setError("");
    setText("");
    try {
      let result = "";
      if (/\.pdf$/i.test(file.name)) {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).href;
        const task = pdfjs.getDocument({
          data: await file.arrayBuffer(),
          isEvalSupported: false,
        });
        const doc = await task.promise;
        try {
          if (!Number.isInteger(page) || page < 1 || page > doc.numPages)
            throw new Error(
              `PDFda ${doc.numPages} sahifa bor. To‘g‘ri sahifani tanlang.`,
            );
          const content = await (await doc.getPage(page)).getTextContent();
          result = content.items
            .map((x) => ("str" in x ? x.str + (x.hasEOL ? "\n" : " ") : ""))
            .join("");
        } finally {
          await doc.destroy();
        }
      } else result = await file.text();
      if (!result.trim())
        throw new Error(
          "Bu sahifadan matn topilmadi. Skanerlangan rasm uchun OCR hali ulanmagan; kerakli matnni pastga kiriting.",
        );
      if (run === job.current) setText(result.slice(0, 12000));
    } catch (e) {
      if (run === job.current)
        setError(
          e instanceof Error
            ? e.message
            : "Manba o‘qilmadi. Boshqa fayl tanlang.",
        );
    } finally {
      if (run === job.current) setBusy(false);
    }
  }
  return (
    <details className="source-upload">
      <summary>
        <Upload size={15} />
        Manba yuklash <small>PDF yoki matn</small>
      </summary>
      <p>
        PDFning tanlangan sahifasidan matn o‘qiladi. Mavzuni manbadan tanlang;
        misollar mahalliy matematik shablondan yaratiladi. Erkin matn va
        rasmlarni AI tahlil qilish hali ulanmagan.
      </p>
      <div className="source-controls">
        <Field label="Darslik yoki qo‘shimcha manba">
          <input
            ref={input}
            type="file"
            accept=".pdf,.txt,text/plain,application/pdf"
            onChange={(e) => {
              job.current++;
              setBusy(false);
              setText("");
              setError("");
              const next = e.target.files?.[0];
              if (
                next &&
                (!/\.(pdf|txt)$/i.test(next.name) ||
                  next.size > 10 * 1024 * 1024)
              ) {
                setError("10 MB gacha PDF yoki TXT fayl tanlang.");
                setFile(null);
                return;
              }
              setFile(next || null);
            }}
          />
        </Field>
        <Field label="PDF sahifasi">
          <input
            type="number"
            min={1}
            max={2000}
            value={page}
            onChange={(e) => {
              job.current++;
              setBusy(false);
              setText("");
              setPage(Number(e.target.value));
            }}
          />
        </Field>
        <Button
          variant="outline"
          disabled={!file || busy}
          onClick={() => void read()}
        >
          <FileText size={15} />
          {busy ? "O‘qilmoqda…" : "Matnni o‘qish"}
        </Button>
        {file && (
          <Button
            variant="ghost"
            aria-label="Manbani olib tashlash"
            onClick={() => {
              job.current++;
              setFile(null);
              setText("");
              setError("");
              setBusy(false);
              if (input.current) input.current.value = "";
            }}
          >
            <X size={16} />
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
      {(text || error) && (
        <Field label="Manba matni">
          <textarea
            rows={5}
            maxLength={12000}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </Field>
      )}
      {!!suggestions.length && (
        <div className="source-suggestions">
          <span>Manbadagi mavzular:</span>
          {suggestions.map((t) => (
            <Button
              key={t.id}
              size="sm"
              variant="outline"
              onClick={() =>
                usePreparation
                  .getState()
                  .update({ topic: t.title, subject: t.subject })
              }
            >
              {t.title}
            </Button>
          ))}
        </div>
      )}
      <small>
        Fayl serverga yuborilmaydi va hisobga saqlanmaydi. PDF formulalarini asl
        sahifa bilan solishtiring.
      </small>
    </details>
  );
}
