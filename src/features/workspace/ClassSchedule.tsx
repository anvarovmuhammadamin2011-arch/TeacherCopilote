import { useSearchParams } from "react-router-dom";
import { School, CalendarDays } from "lucide-react";
import { Classes } from "@/features/classes/Classes";
import Calendar from "@/features/calendar/Calendar";
import { PageHead } from "@/components/common";
import "./workspace.css";
export default function ClassSchedule() {
  const [params, setParams] = useSearchParams();
  const schedule = params.get("view") === "schedule";
  return (
    <>
      <PageHead
        title="Sinflar va jadval"
        description="Dars beradigan sinflaringiz va rejalashtirilgan darslar."
      />
      <div
        className="workspace-tabs"
        role="group"
        aria-label="Sinflar va jadval ko‘rinishi"
      >
        <button
          aria-pressed={!schedule}
          onClick={() => setParams({ view: "classes" })}
        >
          <School size={17} />
          Sinflar
        </button>
        <button
          aria-pressed={schedule}
          onClick={() => setParams({ view: "schedule" })}
        >
          <CalendarDays size={17} />
          Dars jadvali
        </button>
      </div>
      {schedule ? <Calendar embedded /> : <Classes embedded />}
    </>
  );
}
