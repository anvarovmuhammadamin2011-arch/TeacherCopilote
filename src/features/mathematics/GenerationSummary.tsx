import type { GenerationSnapshot } from "@/types";
export default function GenerationSummary({
  value,
}: {
  value?: GenerationSnapshot;
}) {
  if (!value) return null;
  return (
    <p className="generation-summary">
      Yaratilgan natija: <b>{value.topic}</b> · {value.grade}-sinf ·{" "}
      {value.subject} · {value.level || "O‘rta"}
      {value.count ? ` · ${value.count} ta` : ""}
      {value.variants ? ` · ${value.variants} variant` : ""}. Darslikning
      muayyan nashriga mosligi tasdiqlanmagan.
    </p>
  );
}
