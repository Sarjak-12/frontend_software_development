import { format, parseISO } from "date-fns";
import { getMonthDays } from "../utils/date";

const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarGrid({ currentDate, events = [], onDayClick }) {
  const days = getMonthDays(currentDate);

  const eventsByDate = events.reduce((acc, event) => {
    const key = format(parseISO(event.start_time), "yyyy-MM-dd");
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

  return (
    <div className="glass rounded-2xl p-4">
      <div className="grid grid-cols-7 gap-2">
        {weekLabels.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-[var(--text-muted)]">
            {label}
          </div>
        ))}
        {days.map((day) => {
          const key = format(day.date, "yyyy-MM-dd");
          const dayEvents = eventsByDate[key] || [];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onDayClick?.(day.date)}
              className={`min-h-20 rounded-xl border p-2 text-left transition ${
                day.inMonth
                  ? "border-[var(--border)] bg-white/[0.02] hover:border-[var(--primary)]"
                  : "border-transparent bg-transparent opacity-45"
              } ${day.isToday ? "ring-1 ring-[var(--primary)]" : ""}`}
            >
              <div className="text-xs">{format(day.date, "d")}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <span
                    key={event.id}
                    title={event.title}
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: event.color || "var(--primary)" }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
