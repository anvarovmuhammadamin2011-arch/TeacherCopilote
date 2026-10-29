import { useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { Modal, SearchInput, Button, Empty } from "@/components/common";
export function SearchSelect({
  label,
  value,
  options,
  onChange,
  allowCustom = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  allowCustom?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="field">
      <span>{label}</span>
      <button
        className="search-select-trigger"
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => {
          setQuery("");
          setOpen(true);
        }}
      >
        <span>{value || "Tanlang…"}</span>
        <ChevronDown size={15} />
      </button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={label}
        description="Ro‘yxatdan qidiring va kerakli variantni tanlang."
      >
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={label + " bo‘yicha qidirish…"}
        />
        <div className="select-options" role="listbox" aria-label={label}>
          {filtered.map((o) => (
            <button
              type="button"
              role="option"
              aria-selected={value === o}
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
            >
              {o}
              {value === o && <Check size={16} />}
            </button>
          ))}
          {allowCustom && query.trim() && !options.includes(query.trim()) && (
            <Button
              type="button"
              variant="outline"
              className="full"
              onClick={() => {
                onChange(query.trim());
                setOpen(false);
              }}
            >
              <Plus size={14} />«{query.trim()}» ni qo‘shish
            </Button>
          )}
          {!filtered.length && !allowCustom && (
            <Empty title="Mos variant topilmadi" />
          )}
        </div>
      </Modal>
    </div>
  );
}
