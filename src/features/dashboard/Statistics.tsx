import { useStore } from "@/stores/useStore";
import { PageHead, Card, CardHead, Empty, DemoNote } from "@/components/common";
export default function Statistics() {
  const db = useStore((s) => s.db);
  const metrics = [
    ["Dars rejalari", db.lessons.length],
    ["Testlar", db.quizzes.length],
    ["Uy vazifalari", db.documents.filter((d) => d.kind === "homework").length],
    ["Konspektlar", db.documents.filter((d) => d.kind === "conspect").length],
    [
      "Saqlangan materiallar",
      db.materials.length +
        db.lessons.length +
        db.quizzes.length +
        db.documents.length,
    ],
    ["AI so‘rovlari", db.aiUsage.length],
  ];
  const kinds = [...new Set(db.aiUsage.map((u) => u.kind))];
  return (
    <>
      <PageHead
        title="Shaxsiy statistika"
        description="Yaratgan hujjatlaringiz va vositalardan foydalanish faolligi."
      />
      <DemoNote>
        Sonlar shu brauzerda saqlangan demo yozuvlar va haqiqiy bosilgan AI
        yaratish amallaridan hisoblanadi. Tejalgan vaqt o‘lchanmaydi.
      </DemoNote>
      <div className="teacher-stats">
        {metrics.map(([name, n]) => (
          <Card key={name}>
            <strong>{n}</strong>
            <p>{name}</p>
          </Card>
        ))}
      </div>
      <Card>
        <CardHead title="AI vositalaridan foydalanish" />
        {kinds.length ? (
          kinds.map((k) => {
            const n = db.aiUsage.filter((u) => u.kind === k).length;
            return (
              <div className="usage-row" key={k}>
                <div>
                  <span>{k}</span>
                  <b>{n} ta</b>
                </div>
                <div className="usage-track">
                  <span
                    style={{
                      width: (n / Math.max(1, db.aiUsage.length)) * 100 + "%",
                    }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <Empty
            title="Hali AI so‘rovi yo‘q"
            description="AI vositalarida namuna yaratsangiz, faollik shu yerda ko‘rinadi."
          />
        )}
      </Card>
    </>
  );
}
