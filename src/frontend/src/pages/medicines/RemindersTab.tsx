import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type Reminder,
  useDeleteReminder,
  useDoseHistory,
  useLogDose,
  useReminders,
} from "@/hooks/use-health-data";
import {
  Bell,
  BellOff,
  CheckCircle2,
  Clock,
  Edit2,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AddReminderSheet } from "./AddReminderSheet";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { DoseHistoryMini } from "./DoseHistoryMini";

/** Format bigint nanosecond-offset-from-midnight to display "9:00 AM" */
function formatHourDisplay(ns: bigint): string {
  const totalSec = Number(ns / 1_000_000_000n);
  const hour = Math.floor(totalSec / 3600) % 24;
  const min = Math.floor((totalSec % 3600) / 60);
  const period = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${min.toString().padStart(2, "0")} ${period}`;
}

function isTodayNs(ns: bigint): boolean {
  const date = new Date(Number(ns / 1_000_000n));
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function ReminderCard({
  reminder,
  index,
  onEdit,
  onDelete,
}: {
  reminder: Reminder;
  index: number;
  onEdit: (r: Reminder) => void;
  onDelete: (r: Reminder) => void;
}) {
  const logDoseMutation = useLogDose();
  const { data: doseHistory } = useDoseHistory();

  const todayTaken = doseHistory?.some(
    (d) => d.reminderId === reminder.id && isTodayNs(d.takenAt),
  );

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d,
      taken: doseHistory?.some((dose) => {
        if (dose.reminderId !== reminder.id) return false;
        const doseDate = new Date(Number(dose.takenAt / 1_000_000n));
        return (
          doseDate.getFullYear() === d.getFullYear() &&
          doseDate.getMonth() === d.getMonth() &&
          doseDate.getDate() === d.getDate()
        );
      }),
    };
  });

  const handleMarkTaken = () => {
    logDoseMutation.mutate(
      { reminderId: reminder.id },
      {
        onSuccess: () => toast.success("Dose recorded!"),
        onError: () => toast.error("Failed to record dose"),
      },
    );
  };

  return (
    <motion.div
      data-ocid={`medicines.reminder.item.${index + 1}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="bg-card border border-border rounded-xl overflow-hidden shadow-xs"
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-2 p-4 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              reminder.isActive ? "bg-primary/10" : "bg-muted"
            }`}
          >
            <Bell
              className={`w-5 h-5 ${reminder.isActive ? "text-primary" : "text-muted-foreground"}`}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-display font-semibold text-foreground truncate">
              {reminder.medicineName}
            </p>
            <p className="text-xs text-muted-foreground">{reminder.dosage}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!reminder.isActive && (
            <BellOff className="w-3.5 h-3.5 text-muted-foreground mr-1" />
          )}
          <button
            type="button"
            data-ocid={`medicines.reminder.edit_button.${index + 1}`}
            onClick={() => onEdit(reminder)}
            aria-label="Edit reminder"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors tap-highlight-none"
          >
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            type="button"
            data-ocid={`medicines.reminder.delete_button.${index + 1}`}
            onClick={() => onDelete(reminder)}
            aria-label="Delete reminder"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors tap-highlight-none"
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </button>
        </div>
      </div>

      {/* Time chips */}
      <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
        {reminder.reminderTimes.slice(0, 4).map((t) => (
          <div
            key={t.toString()}
            className="flex items-center gap-1.5 bg-primary/8 border border-primary/20 rounded-lg px-2.5 py-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              {formatHourDisplay(t)}
            </span>
          </div>
        ))}
        {reminder.reminderTimes.length > 4 && (
          <Badge variant="outline" className="text-xs h-7">
            +{reminder.reminderTimes.length - 4} more
          </Badge>
        )}
      </div>

      {/* 7-day dose history mini calendar */}
      <DoseHistoryMini days={last7Days} />

      {/* Mark taken action */}
      <div className="border-t border-border px-4 py-3">
        {todayTaken ? (
          <div
            data-ocid={`medicines.reminder.taken_status.${index + 1}`}
            className="flex items-center justify-center gap-2 h-11 rounded-xl bg-secondary/10 border border-secondary/20"
          >
            <CheckCircle2 className="w-4 h-4 text-secondary" />
            <span className="text-sm font-display font-medium text-secondary">
              Today's dose taken
            </span>
          </div>
        ) : (
          <button
            type="button"
            data-ocid={`medicines.reminder.mark_taken_button.${index + 1}`}
            onClick={handleMarkTaken}
            disabled={logDoseMutation.isPending}
            className="w-full h-11 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl text-sm font-display font-semibold transition-smooth active:scale-[0.98] tap-highlight-none disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark as Taken Today
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function RemindersTab({ onAdd }: { onAdd: () => void }) {
  const { data: reminders, isLoading } = useReminders();
  const deleteMutation = useDeleteReminder();
  const [editTarget, setEditTarget] = useState<Reminder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Reminder | null>(null);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`${deleteTarget.medicineName} reminder deleted`);
        setDeleteTarget(null);
      },
      onError: () => toast.error("Failed to delete reminder"),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!reminders?.length) {
    return (
      <div
        data-ocid="medicines.reminders.empty_state"
        className="flex flex-col items-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Bell className="w-8 h-8 text-primary" />
        </div>
        <p className="text-base font-display font-semibold text-foreground mb-1">
          No reminders set
        </p>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
          Set medicine reminders to stay on track with your daily doses.
        </p>
        <button
          type="button"
          data-ocid="medicines.add_reminder_empty_button"
          onClick={onAdd}
          className="flex items-center justify-center gap-2 h-12 px-6 bg-primary text-primary-foreground rounded-xl text-sm font-display font-semibold transition-smooth active:scale-95 tap-highlight-none"
        >
          <Plus className="w-4 h-4" />
          Add Reminder
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3" data-ocid="medicines.reminders_list">
        {reminders.map((reminder, i) => (
          <ReminderCard
            key={reminder.id.toString()}
            reminder={reminder}
            index={i}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
          />
        ))}
      </div>

      <AddReminderSheet
        open={!!editTarget}
        editReminder={editTarget ?? undefined}
        onClose={() => setEditTarget(null)}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        medicineName={deleteTarget?.medicineName ?? ""}
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
