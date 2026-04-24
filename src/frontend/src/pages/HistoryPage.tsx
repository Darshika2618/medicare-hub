import { Variant_lab_other_imaging } from "@/backend";
import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type FollowUp,
  type Prescription,
  type Report,
  useFollowUps,
  usePrescriptions,
  useReports,
} from "@/hooks/use-health-data";
import { formatDate, nsToDate } from "@/lib/backend-client";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarCheck,
  ChevronRight,
  Clock,
  FileText,
  HeartPulse,
  Pill,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

// ─── Timeline entry model ─────────────────────────────────────────────────────

type EntryType = "prescription" | "report" | "followup";
type FilterType = "all" | EntryType;

interface TimelineEntry {
  id: string;
  type: EntryType;
  title: string;
  detail: string;
  date: Date;
  dateNs: bigint;
}

// ─── Converters ────────────────────────────────────────────────────────────────

function rxToEntry(rx: Prescription): TimelineEntry {
  return {
    id: `rx-${rx.id.toString()}`,
    type: "prescription",
    title: rx.medicineName,
    detail: `${rx.dosage} · ${rx.frequency}`,
    date: nsToDate(rx.createdAt),
    dateNs: rx.createdAt,
  };
}

function repToEntry(rep: Report): TimelineEntry {
  const notes = rep.notes || "No notes";
  const short = notes.length > 80 ? `${notes.slice(0, 80)}…` : notes;
  const typeLabel =
    rep.reportType === Variant_lab_other_imaging.lab
      ? "Lab Results"
      : rep.reportType === Variant_lab_other_imaging.imaging
        ? "Imaging"
        : "Other";
  return {
    id: `rep-${rep.id.toString()}`,
    type: "report",
    title: `${typeLabel} report`,
    detail: short,
    date: nsToDate(rep.reportDate),
    dateNs: rep.reportDate,
  };
}

function fuToEntry(fu: FollowUp): TimelineEntry {
  return {
    id: `fu-${fu.id.toString()}`,
    type: "followup",
    title: fu.doctorName,
    detail: fu.department || "Follow-up visit",
    date: nsToDate(fu.scheduledDate),
    dateNs: fu.scheduledDate,
  };
}

function getMonthKey(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ─── Config ────────────────────────────────────────────────────────────────────

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Medicines", value: "prescription" },
  { label: "Reports", value: "report" },
  { label: "Follow-ups", value: "followup" },
];

type EntryConfig = {
  icon: React.ElementType;
  bg: string;
  iconColor: string;
  label: string;
};

const ENTRY_CONFIG: Record<EntryType, EntryConfig> = {
  prescription: {
    icon: Pill,
    bg: "bg-primary/10",
    iconColor: "text-primary",
    label: "Prescription",
  },
  report: {
    icon: FileText,
    bg: "bg-secondary/20",
    iconColor: "text-secondary",
    label: "Report",
  },
  followup: {
    icon: CalendarCheck,
    bg: "bg-accent/15",
    iconColor: "text-accent",
    label: "Follow-up",
  },
};

// ─── Filter Bar ────────────────────────────────────────────────────────────────

function FilterBar({
  active,
  onChange,
}: {
  active: FilterType;
  onChange: (f: FilterType) => void;
}) {
  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-none px-4 py-3 bg-card border-b border-border sticky top-0 z-10"
      role="tablist"
      aria-label="Filter timeline"
    >
      {FILTER_OPTIONS.map((f) => (
        <button
          key={f.value}
          type="button"
          role="tab"
          aria-selected={active === f.value}
          data-ocid={`history.filter.${f.value}`}
          onClick={() => onChange(f.value)}
          className={[
            "flex-shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-smooth tap-highlight-none",
            active === f.value
              ? "bg-primary text-primary-foreground shadow-subtle"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          ].join(" ")}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

// ─── Timeline Entry Card ───────────────────────────────────────────────────────

function EntryCard({
  entry,
  index,
  isLast,
  onClick,
}: {
  entry: TimelineEntry;
  index: number;
  isLast: boolean;
  onClick: () => void;
}) {
  const cfg = ENTRY_CONFIG[entry.type];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.04, 0.4) }}
      className="relative flex gap-3"
    >
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center ${cfg.bg}`}
        >
          <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
        </div>
        {!isLast && (
          <div
            className="w-px flex-1 bg-border mt-1"
            style={{ minHeight: "1.25rem" }}
          />
        )}
      </div>

      <button
        type="button"
        data-ocid={`history.item.${index + 1}`}
        onClick={onClick}
        className="flex-1 bg-card rounded-xl border border-border shadow-subtle p-3.5 mb-3 text-left tap-highlight-none active:scale-[0.98] transition-smooth min-w-0"
        aria-label={`${cfg.label}: ${entry.title}`}
      >
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${cfg.iconColor}`}
            >
              {cfg.label}
            </span>
            <p className="font-semibold text-foreground text-sm mt-0.5 truncate">
              {entry.title}
            </p>
            <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2 break-words">
              {entry.detail}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="text-xs whitespace-nowrap">
                {formatDate(entry.dateNs)}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </button>
    </motion.div>
  );
}

// ─── Month Header ─────────────────────────────────────────────────────────────

function MonthHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-2">
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TimelineSkeleton() {
  return (
    <div className="px-4 pt-4 space-y-5" data-ocid="history.loading_state">
      {[...Array(5)].map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
        <div key={i} className="flex gap-3">
          <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      data-ocid="history.empty_state"
      className="flex flex-col items-center justify-center gap-4 px-8 py-20 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <HeartPulse className="w-8 h-8 text-primary" />
      </div>
      <div>
        <p className="text-foreground font-semibold text-base">
          {filtered ? "No matches found" : "No history yet"}
        </p>
        <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
          {filtered
            ? "Try selecting a different filter to see your health events."
            : "Your prescriptions, reports, and follow-up visits will appear here as you use MediCare Hub."}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function HistoryPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const { data: prescriptions, isLoading: rxLoading } = usePrescriptions();
  const { data: reports, isLoading: repLoading } = useReports();
  const { data: followUps, isLoading: fuLoading } = useFollowUps();

  const isLoading = rxLoading || repLoading || fuLoading;

  const allEntries = useMemo<TimelineEntry[]>(() => {
    const entries: TimelineEntry[] = [
      ...(prescriptions ?? []).map(rxToEntry),
      ...(reports ?? []).map(repToEntry),
      ...(followUps ?? []).map(fuToEntry),
    ];
    return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [prescriptions, reports, followUps]);

  const filteredEntries = useMemo<TimelineEntry[]>(() => {
    if (activeFilter === "all") return allEntries;
    return allEntries.filter((e) => e.type === activeFilter);
  }, [allEntries, activeFilter]);

  const grouped = useMemo(() => {
    const groups: Array<{ label: string; entries: TimelineEntry[] }> = [];
    const indexMap = new Map<string, number>();
    for (const entry of filteredEntries) {
      const key = getMonthKey(entry.date);
      if (!indexMap.has(key)) {
        indexMap.set(key, groups.length);
        groups.push({ label: key, entries: [] });
      }
      const idx = indexMap.get(key)!;
      groups[idx].entries.push(entry);
    }
    return groups;
  }, [filteredEntries]);

  function handleEntryTap(entry: TimelineEntry) {
    if (entry.type === "prescription") {
      navigate({ to: "/medicines" });
    } else if (entry.type === "report") {
      navigate({ to: "/reports" });
    } else {
      navigate({ to: "/followups" });
    }
  }

  const header = (
    <div>
      <h1 className="text-lg font-display font-bold text-foreground">
        Health History
      </h1>
      <p className="text-xs text-muted-foreground mt-0.5">
        Your complete health timeline
      </p>
    </div>
  );

  return (
    <Layout header={header}>
      <div className="-mx-4 -mt-4">
        <FilterBar active={activeFilter} onChange={setActiveFilter} />
      </div>

      <div data-ocid="history.page" className="pt-3">
        {isLoading ? (
          <TimelineSkeleton />
        ) : filteredEntries.length === 0 ? (
          <EmptyState filtered={activeFilter !== "all"} />
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="pb-6"
            >
              {grouped.map((group) => {
                let offset = 0;
                for (const g of grouped) {
                  if (g.label === group.label) break;
                  offset += g.entries.length;
                }

                return (
                  <div key={group.label}>
                    <MonthHeader label={group.label} />
                    {group.entries.map((entry, i) => (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        index={offset + i}
                        isLast={i === group.entries.length - 1}
                        onClick={() => handleEntryTap(entry)}
                      />
                    ))}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </Layout>
  );
}
