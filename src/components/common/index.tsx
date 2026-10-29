import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Plus,
  Search,
  ArrowUpRight,
  Inbox,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export { Button };
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-content">
          <div className="modal-head">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description>
                {description || "Demo muhitidagi ma’lumotlarni boshqaring."}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Yopish">
                <X size={20} />
              </Button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Confirm({
  children,
  onConfirm,
  title = "O‘chirishni tasdiqlaysizmi?",
  description = "Bu amal demo ma’lumotni shu brauzerdan o‘chiradi.",
}: {
  children: ReactNode;
  onConfirm: () => void;
  title?: string;
  description?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
      >
        <div className="modal-actions">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Bekor qilish
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Tasdiqlash
          </Button>
        </div>
      </Modal>
    </>
  );
}
export function PageHead({
  title,
  description,
  action,
  eyebrow,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`}>{children}</section>;
}
export function CardHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card-head">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
export function Badge({
  children,
  tone = "",
}: {
  children: ReactNode;
  tone?: string;
}) {
  const t =
    tone ||
    (["Tayyor", "Keldi", "Yakunlangan", "Tekshirildi"].includes(
      String(children),
    )
      ? "green"
      : ["Qoralama", "Kechikdi", "Tekshirilmoqda"].includes(String(children))
        ? "amber"
        : ["Kelmadi"].includes(String(children))
          ? "red"
          : "blue");
  return <span className={`badge ${t}`}>{children}</span>;
}
export function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <small className="error-text">{error}</small>}
    </label>
  );
}
export function SearchInput({
  value,
  onChange,
  placeholder = "Qidirish…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="search-input">
      <Search size={17} />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
export function Empty({
  title = "Hozircha ma’lumot yo‘q",
  description = "Boshqa filtrni tanlang yoki yangi ma’lumot qo‘shing.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <Inbox size={34} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" /> Yuklanmoqda…
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}
export function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="empty">
      <TriangleAlert />
      <h3>Ma’lumotni yuklab bo‘lmadi</h3>
      <Button onClick={retry}>Qayta urinish</Button>
    </div>
  );
}
export function NewLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Button asChild>
      <Link to={to}>
        <Plus size={17} />
        {children}
      </Link>
    </Button>
  );
}
export function MoreLink({
  to,
  children = "Barchasini ko‘rish",
}: {
  to: string;
  children?: ReactNode;
}) {
  return (
    <Link className="text-link" to={to}>
      {children}
      <ArrowUpRight size={15} />
    </Link>
  );
}
export function Progress({
  value,
  tone = "blue",
}: {
  value: number;
  tone?: string;
}) {
  return (
    <div
      className={`progress ${tone}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}
export async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Nusxalandi");
  } catch {
    toast.error("Nusxalab bo‘lmadi. Matnni belgilab nusxalang.");
  }
}
export function DemoNote({
  children = "Namoyish rejimi. Ma’lumotlar faqat shu brauzerda saqlanadi.",
}: {
  children?: ReactNode;
}) {
  return (
    <div className="demo-note">
      <span className="status-dot" />
      {children}
    </div>
  );
}
