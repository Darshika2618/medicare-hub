import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  type FollowUp,
  type Reminder,
  Variant_scheduled_rescheduled_completed,
  useCompleteFollowUp,
  useDashboardSummary,
  useDoseHistory,
  useLogDose,
} from "@/hooks/use-health-data";
import {
  formatDate,
  getRelativeDateLabel,
  isWithinDays,
} from "@/lib/backend-client";
import {
  Bell,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  FileUp,
  MapPin,
  Pill,
  PillBottle,
  Stethoscope,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { toast } from "sonner";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Format reminder time offset (ns from midnight) to display string */
function formatReminderTime(ns: bigint): string {
  const totalSec = Number(ns / 1_000_000_000n);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const period = h >= 12 ? "PM" : "AM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:${m.toString().padStart(2, "0")} ${period}`;
}

function isPastTime(ns: bigint): boolean {
  const totalSec = Number(ns / 1_000_000_000n);
  const now = new Date();
  const currentSec = now.getHours() * 3600 + now.getMinutes() * 60;
  return totalSec < currentSec;
}

type DoseStatus = "taken" | "missed" | "upcoming";

function getDoseStatus(reminder: Reminder, takenIds: Set<string>): DoseStatus {
  if (takenIds.has(reminder.id.toString())) return "taken";
  const firstTime = reminder.reminderTimes[0] ?? 0n;
  if (isPastTime(firstTime)) return "missed";
  return "upcoming";
}

// ─── Time-of-day grouping ────────────────────────────────────────────────────

type TimeOfDay = "Morning" | "Afternoon" | "Evening";

function getTimeOfDay(ns: bigint): TimeOfDay {
  const totalSec = Number(ns / 1_000_000_000n);
  const h = Math.floor(totalSec / 3600);
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

const TIME_OF_DAY_ORDER: TimeOfDay[] = ["Morning", "Afternoon", "Evening"];

function groupRemindersByTimeOfDay(
  reminders: Reminder[],
): Array<{ label: TimeOfDay; items: Reminder[] }> {
  const map = new Map<TimeOfDay, Reminder[]>();
  for (const r of reminders) {
    const t = getTimeOfDay(r.reminderTimes[0] ?? 0n);
    const existing = map.get(t) ?? [];
    existing.push(r);
    map.set(t, existing);
  }
  return TIME_OF_DAY_ORDER.filter((k) => map.has(k)).map((k) => ({
    label: k,
    items: map.get(k)!,
  }));
}

const TIME_OF_DAY_ICON: Record<TimeOfDay, string> = {
  Morning: "🌅",
  Afternoon: "☀️",
  Evening: "🌙",
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function MedicineCard({
  reminder,
  index,
  status,
  onMarkTaken,
  isMarkingTaken,
}: {
  reminder: Reminder;
  index: number;
  status: DoseStatus;
  onMarkTaken: (id: bigint) => void;
  isMarkingTaken: boolean;
}) {
  const firstTime = reminder.reminderTimes[0] ?? 0n;
  const timeDisplay = formatReminderTime(firstTime);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      data-ocid={`medicine.item.${index + 1}`}
      className={`relative rounded-xl border overflow-hidden mb-3 last:mb-0 transition-smooth ${
        status === "taken"
          ? "border-secondary/20 bg-secondary/5"
          : status === "missed"
            ? "border-warning/30 bg-warning/5"
            : "border-border bg-card"
      }`}
    >
      {status === "missed" && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning rounded-l-xl" />
      )}
      {status === "upcoming" && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />
      )}

      <div className="flex items-start gap-3 p-3 pl-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
            status === "taken"
              ? "bg-secondary/15"
              : status === "missed"
                ? "bg-warning/15"
                : "bg-primary/12"
          }`}
        >
          <Pill
            className={`w-5 h-5 ${
              status === "taken"
                ? "text-secondary"
                : status === "missed"
                  ? "text-warning"
                  : "text-primary"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-display font-semibold text-foreground truncate">
                {reminder.medicineName}{" "}
                <span className="font-normal text-muted-foreground text-xs">
                  ({reminder.dosage})
                </span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-mono text-foreground font-semibold">
                {timeDisplay}
              </p>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            {status === "taken" ? (
              <span
                className="flex items-center gap-1.5 text-xs font-medium text-secondary"
                data-ocid={`medicine.taken_badge.${index + 1}`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Taken
              </span>
            ) : status === "missed" ? (
              <Badge
                data-ocid={`medicine.missed_badge.${index + 1}`}
                className="bg-warning/15 text-warning border-warning/30 text-[10px] font-semibold px-2 py-0.5"
                variant="outline"
              >
                Missed
              </Badge>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                Upcoming
              </span>
            )}

            {status === "upcoming" && (
              <button
                type="button"
                data-ocid={`medicine.mark_taken_button.${index + 1}`}
                onClick={() => onMarkTaken(reminder.id)}
                disabled={isMarkingTaken}
                className="ml-auto flex items-center justify-center h-9 px-4 bg-primary text-primary-foreground text-xs font-display font-semibold rounded-lg transition-smooth active:scale-95 disabled:opacity-60 min-w-[100px]"
              >
                Mark as Taken
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FollowUpCard({
  followUp,
  index,
  onComplete,
  isCompleting,
}: {
  followUp: FollowUp;
  index: number;
  onComplete: (id: bigint) => void;
  isCompleting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      data-ocid={`followup.item.${index + 1}`}
      className="bg-card border border-border rounded-xl p-4 mb-3 last:mb-0 shadow-xs"
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <Stethoscope className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-display font-semibold text-foreground truncate">
              {followUp.doctorName}
            </p>
            <Badge
              variant="outline"
              className="shrink-0 text-[10px] border-accent/40 text-accent font-semibold px-2"
            >
              {getRelativeDateLabel(followUp.scheduledDate)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {followUp.department}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {formatDate(followUp.scheduledDate, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <button
        type="button"
        data-ocid={`followup.done_button.${index + 1}`}
        onClick={() => onComplete(followUp.id)}
        disabled={isCompleting}
        className="mt-3 w-full h-10 flex items-center justify-center gap-2 border border-accent/40 text-accent text-sm font-display font-semibold rounded-lg transition-smooth active:scale-[0.98] hover:bg-accent/8 disabled:opacity-60"
      >
        <CheckCircle2 className="w-4 h-4" />
        Mark as Done
      </button>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { principal } = useAuth();
  const { data: summary, isLoading } = useDashboardSummary();
  const { data: doseHistory } = useDoseHistory();
  const logDoseMutation = useLogDose();
  const completeFollowUpMutation = useCompleteFollowUp();

  // Build taken set from today's dose history records.
  // Key format matches getDoseStatus: reminderId.toString()
  const takenIds = useMemo<Set<string>>(() => {
    if (!doseHistory) return new Set();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartNs = BigInt(todayStart.getTime()) * 1_000_000n;
    const s = new Set<string>();
    for (const record of doseHistory) {
      if (record.takenAt >= todayStartNs) {
        s.add(record.reminderId.toString());
      }
    }
    return s;
  }, [doseHistory]);

  const handleMarkTaken = (reminderId: bigint) => {
    logDoseMutation.mutate(
      { reminderId },
      {
        onSuccess: () => toast.success("Dose recorded successfully!"),
        onError: () => toast.error("Failed to record dose. Try again."),
      },
    );
  };

  const handleCompleteFollowUp = (id: bigint) => {
    completeFollowUpMutation.mutate(id, {
      onSuccess: () => toast.success("Appointment marked as done!"),
      onError: () => toast.error("Failed to update appointment. Try again."),
    });
  };

  const displayName = principal ? principal.slice(0, 8) : "there";

  const upcomingFollowUps = (summary?.upcomingFollowUps ?? []).filter(
    (f) =>
      f.status === Variant_scheduled_rescheduled_completed.scheduled &&
      isWithinDays(f.scheduledDate, 7),
  );

  const nextReminder = summary?.todayReminders.find(
    (r) => !takenIds.has(r.id.toString()),
  );
  const nextTime = nextReminder?.reminderTimes[0];

  const missedCount =
    summary?.todayReminders.filter(
      (r) =>
        !takenIds.has(r.id.toString()) && isPastTime(r.reminderTimes[0] ?? 0n),
    ).length ?? 0;

  const activePrescriptionCount = summary?.activePrescriptions.length ?? 0;

  const quickActions = [
    {
      label: "Add Medicine",
      icon: PillBottle,
      href: "/medicines",
      ocid: "dashboard.quick_add_medicine",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Upload Report",
      icon: FileUp,
      href: "/reports",
      ocid: "dashboard.quick_upload_report",
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Schedule Visit",
      icon: CalendarPlus,
      href: "/followups",
      ocid: "dashboard.quick_schedule_visit",
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  const header = (
    <div className="flex items-start justify-between">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{getTodayLabel()}</p>
        <h1 className="text-xl font-display font-bold text-foreground leading-tight mt-0.5">
          {getGreeting()},{" "}
          <span className="text-primary font-mono text-base">
            {displayName}
          </span>
        </h1>
      </div>
      {missedCount > 0 && (
        <div
          data-ocid="dashboard.missed_alert"
          className="flex items-center gap-1.5 bg-warning/15 border border-warning/30 rounded-full px-3 py-1 shrink-0"
        >
          <Bell className="w-3.5 h-3.5 text-warning" />
          <span className="text-xs font-semibold text-warning">
            {missedCount} missed
          </span>
        </div>
      )}
    </div>
  );

  return (
    <Layout header={header}>
      {/* ── Stats Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-3 gap-3 mb-5"
        data-ocid="dashboard.stats_section"
      >
        {[
          {
            label: "Active Medicines",
            value: activePrescriptionCount,
            icon: Pill,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Today's Doses",
            value: summary?.todayReminders.length ?? 0,
            icon: Bell,
            color: "text-secondary",
            bg: "bg-secondary/10",
          },
          {
            label: "Upcoming Visits",
            value: summary?.upcomingFollowUps.length ?? 0,
            icon: Calendar,
            color: "text-accent",
            bg: "bg-accent/10",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl p-3 border border-border shadow-xs text-center"
          >
            <div
              className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mx-auto mb-1.5`}
            >
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-8 mx-auto mb-1" />
            ) : (
              <p className={`text-xl font-display font-bold ${stat.color}`}>
                {stat.value}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground leading-tight">
              {stat.label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* ── Today's Medications ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-card rounded-2xl border border-border shadow-card overflow-hidden mb-5"
        data-ocid="dashboard.medicines_section"
      >
        <div className="bg-primary px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-display font-bold text-primary-foreground">
                Today's Medications
              </h2>
              {isLoading ? (
                <Skeleton className="h-3 w-28 mt-1.5 bg-primary-foreground/20" />
              ) : (
                <p className="text-xs text-primary-foreground/80 mt-0.5">
                  {summary?.todayReminders.length ?? 0} medicines
                  {nextTime && (
                    <span className="ml-1.5">
                      · Next: {formatReminderTime(nextTime)}
                    </span>
                  )}
                </p>
              )}
            </div>
            <Badge className="bg-primary-foreground/15 text-primary-foreground border-0 font-semibold text-[11px] px-2.5">
              {takenIds.size}/{summary?.todayReminders.length ?? 0} taken
            </Badge>
          </div>
        </div>

        <div className="p-3" data-ocid="dashboard.medicine_list">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex gap-3 p-3 rounded-xl border border-border"
                >
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-8 w-28 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : (summary?.todayReminders.length ?? 0) === 0 ? (
            <div
              data-ocid="dashboard.medicine_list.empty_state"
              className="py-10 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-secondary/15 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-secondary" />
              </div>
              <p className="text-sm font-display font-semibold text-foreground">
                All done for today!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                No medicines scheduled
              </p>
            </div>
          ) : (
            (() => {
              const groups = groupRemindersByTimeOfDay(
                summary?.todayReminders ?? [],
              );
              let globalIndex = 0;
              return groups.map((group) => (
                <div key={group.label}>
                  <div className="flex items-center gap-2 mb-2 mt-1 first:mt-0">
                    <span className="text-xs">
                      {TIME_OF_DAY_ICON[group.label]}
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      {group.label}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  {group.items.map((reminder) => {
                    const i = globalIndex++;
                    return (
                      <MedicineCard
                        key={reminder.id.toString()}
                        reminder={reminder}
                        index={i}
                        status={getDoseStatus(reminder, takenIds)}
                        onMarkTaken={handleMarkTaken}
                        isMarkingTaken={logDoseMutation.isPending}
                      />
                    );
                  })}
                </div>
              ));
            })()
          )}
        </div>
      </motion.section>

      {/* ── Upcoming Follow-Ups ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-5"
        data-ocid="dashboard.followups_section"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-display font-bold text-foreground">
            Upcoming Follow-Ups
          </h2>
          <a
            href="/followups"
            data-ocid="dashboard.followups_view_all"
            className="text-xs font-medium text-primary underline-offset-2 hover:underline"
          >
            View all
          </a>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex gap-3">
                  <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full rounded-lg mt-3" />
              </div>
            ))}
          </div>
        ) : upcomingFollowUps.length === 0 ? (
          <div
            data-ocid="dashboard.followups_section.empty_state"
            className="bg-card border border-border rounded-xl py-8 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No visits this week
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Schedule a follow-up with your doctor
            </p>
          </div>
        ) : (
          upcomingFollowUps.map((fu, i) => (
            <FollowUpCard
              key={fu.id.toString()}
              followUp={fu}
              index={i}
              onComplete={handleCompleteFollowUp}
              isCompleting={completeFollowUpMutation.isPending}
            />
          ))
        )}
      </motion.section>

      {/* ── Quick Actions ── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mb-5"
        data-ocid="dashboard.quick_actions_section"
      >
        <h2 className="text-base font-display font-bold text-foreground mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              data-ocid={action.ocid}
              className="flex flex-col items-center gap-2 bg-card border border-border rounded-xl py-4 px-2 transition-smooth active:scale-95 hover:border-primary/30 hover:shadow-sm tap-highlight-none"
            >
              <div
                className={`w-11 h-11 rounded-xl ${action.bg} flex items-center justify-center`}
              >
                <action.icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <span className="text-[11px] font-display font-semibold text-foreground text-center leading-tight">
                {action.label}
              </span>
            </a>
          ))}
        </div>
      </motion.section>

      {/* ── Daily Reminder tip ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-secondary/8 border border-secondary/20 rounded-xl p-4 mb-4"
        data-ocid="dashboard.health_tip"
      >
        <p className="text-xs font-display font-semibold text-secondary mb-0.5">
          💊 Daily Reminder
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Taking medicines at the same time each day helps them work better.
          Consistency is key to your health!
        </p>
      </motion.div>
    </Layout>
  );
}
