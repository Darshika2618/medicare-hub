/**
 * 7-day mini dose history calendar strip.
 * Shows the last 7 days with taken/missed indicators.
 */

interface DaySlot {
  date: Date;
  taken?: boolean;
}

export function DoseHistoryMini({ days }: { days: DaySlot[] }) {
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="px-4 pb-3">
      <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wider">
        Last 7 Days
      </p>
      <div className="flex items-center justify-between gap-1">
        {days.map((slot, i) => {
          const isToday = i === days.length - 1;
          const label = dayLabels[slot.date.getDay()];
          const dayNum = slot.date.getDate();

          return (
            <div
              key={`day-${slot.date.getTime()}`}
              className="flex flex-col items-center gap-1 flex-1"
            >
              <span className="text-[9px] text-muted-foreground">{label}</span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium border transition-colors ${
                  isToday ? "border-primary" : "border-transparent"
                } ${
                  slot.taken
                    ? "bg-secondary/80 text-secondary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
                title={slot.taken ? "Dose taken" : "Dose missed"}
                aria-label={`${slot.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${slot.taken ? "taken" : "missed"}`}
              >
                {dayNum}
              </div>
              <div
                className={`w-1.5 h-1.5 rounded-full ${slot.taken ? "bg-secondary" : "bg-muted-foreground/20"}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
