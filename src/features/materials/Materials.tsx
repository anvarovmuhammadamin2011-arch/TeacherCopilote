import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Star,
  Upload,
  Trash2,
  Pencil,
  FolderOpen,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/stores/useStore";
import { uid, today, downloadText } from "@/utils/cn";
import type { Material } from "@/types";
import {
  PageHead,
  Card,
  Button,
  Badge,
  SearchInput,
  Field,
  Empty,
  Modal,
  Confirm,
  DemoNote,
} from "@/components/common";
export default function Materials() {
  const { db, mutate } = useStore();
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  useEffect(() => setSearch(params.get("search") || ""), [params]);
  const [moving, setMoving] = useState<(Material & { href?: string }) | null>(
    null,
  );
  const [category, setCategory] = useState("");
  const [folder, setFolder] = useState("");
  const [favorites, setFavorites] = useState(false);
  const [upload, setUpload] = useState(false);
  const [preview, setPreview] = useState<Material | null>(null);
  const [edit, setEdit] = useState<Material | null>(null);
  const [title, setTitle] = useState("");
  const [fileSize, setFileSize] = useState("Qayd");
  const [newFolder, setNewFolder] = useState("Umumiy");
  const [newCategory, setNewCategory] = useState("Qaydlar");
  const generated = [
    ...db.lessons.map((x) => ({
      id: x.id,
      title: x.title,
      category: "Dars rejalari",
      date: x.date,
      href: "/teacher/lessons/" + x.id,
    })),
    ...db.quizzes.map((x) => ({
      id: x.id,
      title: x.title,
      category: "Testlar",
      date: x.date,
      href: "/teacher/quizzes/" + x.id,
    })),
    ...db.documents.map((x) => ({
      id: x.id,
      title: x.title,
      category: x.kind === "homework" ? "Uy vazifalari" : "Konspektlar",
      date: x.date,
      href:
        "/teacher/" +
        (x.kind === "homework" ? "homework/" : "conspects/") +
        x.id,
    })),
  ].map((x) => ({
    ...x,
    size: "Hujjat",
    content: "",
    folder: String(
      db.preferences["folder:" + x.href] || "Yaratilgan hujjatlar",
    ),
    favorite: db.preferences["favorite:" + x.href] === true,
  }));
  const all: (Material & { href?: string })[] = [...generated, ...db.materials];
  const folders = [...new Set(all.map((x) => x.folder || "Umumiy"))];
  const categories = [
    ...new Set([
      "Dars rejalari",
      "Testlar",
      "Konspektlar",
      "Uy vazifalari",
      "PDF",
      "DOCX",
      "Rasmlar",
      "Qaydlar",
      ...all.map((x) => x.category),
    ]),
  ];
  const items = all.filter(
    (x) =>
      x.title.toLowerCase().includes(search.toLowerCase()) &&
      (!category || x.category === category) &&
      (!folder || (x.folder || "Umumiy") === folder) &&
      (!favorites || x.favorite),
  );
  return (
    <>
      <PageHead
        title="Materiallarim"
        description="Matematik darslar, testlar, konspektlar va masalalar to‘plami."
        action={
          <Button onClick={() => setUpload(true)}>
            <Upload size={16} />
            Material qo‘shish
          </Button>
        }
      />
      <div className="toolbar">
        <SearchInput value={search} onChange={setSearch} />
        <select
          aria-label="Material turi"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Barcha turlar</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Papka"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
        >
          <option value="">Barcha papkalar</option>
          {folders.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <Button
          variant={favorites ? "default" : "outline"}
          onClick={() => setFavorites(!favorites)}
        >
          <Star size={16} />
          Saralangan
        </Button>
      </div>
      <p className="result-count">{items.length} ta material</p>
      <div className="resource-grid">
        {items.map((m) => (
          <Card key={m.href || m.id}>
            <div className="resource-top">
              <span className="icon-box blue">
                <FileText size={23} />
              </span>
              <Button
                size="icon"
                variant="ghost"
                aria-label={m.title + "ni saralash"}
                onClick={() =>
                  mutate((d) => {
                    if (m.href)
                      d.preferences["favorite:" + m.href] = !m.favorite;
                    else {
                      const item = d.materials.find((x) => x.id === m.id);
                      if (item) item.favorite = !item.favorite;
                    }
                  })
                }
              >
                <Star
                  size={18}
                  fill={m.favorite ? "#f6ba4a" : "none"}
                  color={m.favorite ? "#f6ba4a" : undefined}
                />
              </Button>
            </div>
            <Badge>{m.category}</Badge>
            <h3>
              {m.href ? (
                <Link to={m.href}>{m.title}</Link>
              ) : (
                <button
                  className="material-title"
                  onClick={() => setPreview(m)}
                >
                  {m.title}
                </button>
              )}
            </h3>
            <p>
              <FolderOpen size={12} /> {m.folder || "Umumiy"} · {m.date}
            </p>
            <div className="button-row">
              {m.href ? (
                <Button variant="outline" asChild>
                  <Link to={m.href}>Ochish va tahrirlash</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setPreview(m)}>
                    Ochish
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label="Materialni tahrirlash"
                    onClick={() => setEdit({ ...m })}
                  >
                    <Pencil size={16} />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                aria-label={m.title + " papkasini tanlash"}
                onClick={() => setMoving({ ...m })}
              >
                <FolderOpen size={16} />
              </Button>
              <Confirm
                title="Material o‘chirilsinmi?"
                onConfirm={() =>
                  mutate((d) => {
                    if (m.category === "Dars rejalari")
                      d.lessons = d.lessons.filter((x) => x.id !== m.id);
                    else if (m.category === "Testlar")
                      d.quizzes = d.quizzes.filter((x) => x.id !== m.id);
                    else if (
                      ["Konspektlar", "Uy vazifalari"].includes(m.category)
                    )
                      d.documents = d.documents.filter((x) => x.id !== m.id);
                    else d.materials = d.materials.filter((x) => x.id !== m.id);
                  })
                }
              >
                <Button variant="ghost" aria-label={m.title + "ni o‘chirish"}>
                  <Trash2 size={16} />
                </Button>
              </Confirm>
            </div>
          </Card>
        ))}
      </div>
      {!items.length && <Empty title="Material topilmadi" />}
      <Modal
        open={!!moving}
        onOpenChange={() => setMoving(null)}
        title="Papkaga ko‘chirish"
      >
        {moving && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutate((d) => {
                if (moving.href)
                  d.preferences["folder:" + moving.href] =
                    moving.folder?.trim() || "Umumiy";
                else {
                  const item = d.materials.find((m) => m.id === moving.id);
                  if (item) item.folder = moving.folder?.trim() || "Umumiy";
                }
              });
              setMoving(null);
              toast.success("Papka yangilandi");
            }}
          >
            <Field label="Papka nomi">
              <input
                list="move-folders"
                value={moving.folder || "Umumiy"}
                onChange={(e) =>
                  setMoving({ ...moving, folder: e.target.value })
                }
              />
              <datalist id="move-folders">
                {folders.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </Field>
            <Button>Saqlash</Button>
          </form>
        )}
      </Modal>
      <Modal open={upload} onOpenChange={setUpload} title="Material qo‘shish">
        <DemoNote>
          Faylning nomi va hajmi saqlanadi. Faylning o‘zi serverga yuklanmaydi.
        </DemoNote>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutate((d) =>
              d.materials.unshift({
                id: uid(),
                title: title.trim(),
                category: newCategory,
                size: fileSize,
                date: today(),
                folder: newFolder.trim() || "Umumiy",
                favorite: false,
                content: "Demo fayl kartochkasi. Asl fayl saqlanmagan.",
              }),
            );
            setUpload(false);
            setTitle("");
            toast.success("Material kartochkasi saqlandi");
          }}
        >
          <Field label="Fayl tanlash">
            <input
              type="file"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setTitle(f.name);
                  setFileSize((f.size / 1024).toFixed(1) + " KB");
                  const ext = f.name.split(".").pop()?.toUpperCase();
                  setNewCategory(
                    ext === "PDF" ? "PDF" : ext === "DOCX" ? "DOCX" : "Rasmlar",
                  );
                }
              }}
            />
          </Field>
          <Field label="Material nomi">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="Papka nomi">
            <input
              list="folders"
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
            />
            <datalist id="folders">
              {folders.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </Field>
          <Field label="Toifa">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            >
              {["PDF", "DOCX", "Rasmlar", "Qaydlar"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Button>Saqlash</Button>
        </form>
      </Modal>
      <Modal
        open={!!preview}
        onOpenChange={() => setPreview(null)}
        title={preview?.title || "Material"}
      >
        <DemoNote>Hozir faqat demo kartochka mavjud.</DemoNote>
        <p className="pre-wrap">{preview?.content}</p>
        <Button
          onClick={() =>
            preview && downloadText(preview.title + ".txt", preview.content)
          }
        >
          Matnni yuklash
        </Button>
      </Modal>
      <Modal
        open={!!edit}
        onOpenChange={() => setEdit(null)}
        title="Materialni tahrirlash"
      >
        {edit && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutate((d) => {
                d.materials = d.materials.map((m) =>
                  m.id === edit.id ? edit : m,
                );
              });
              setEdit(null);
            }}
          >
            <Field label="Nomi">
              <input
                required
                value={edit.title}
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
              />
            </Field>
            <Field label="Papka">
              <input
                value={edit.folder || "Umumiy"}
                onChange={(e) => setEdit({ ...edit, folder: e.target.value })}
              />
            </Field>
            <Field label="Qayd">
              <textarea
                value={edit.content}
                onChange={(e) => setEdit({ ...edit, content: e.target.value })}
              />
            </Field>
            <Button>Saqlash</Button>
          </form>
        )}
      </Modal>
    </>
  );
}
