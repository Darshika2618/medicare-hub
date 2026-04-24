import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  type Reminder,
  useAddReminder,
  useUpdateReminder,
} from "@/hooks/use-health-data";
import { Clock, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface FormState {
  medicineName: string;
  dosage: string;
  times: string[]; // ["HH:MM", ...]
}

const defaultForm: FormState = {
  medicineName: "",
  dosage: "",
  times: ["08:00"],
};

// Convert "HH:MM" to nanoseconds offset from midnight
function timeToNs(time: string): bigint {
  const [h, m] = time.split(":").map((s) => Number.parseInt(s, 10));
  return BigInt(((h || 0) * 3600 + (m || 0) * 60) * 1_000_000_000);
}

// Convert nanosecond time offset to "HH:MM"
function nsToTime(ns: bigint): string {
  const totalSec = Number(ns / 1_000_000_000n);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

interface Props {
  open: boolean;
  onClose: () => void;
  editReminder?: Reminder;
}

export function AddReminderSheet({ open, onClose, editReminder }: Props) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const addMutation = useAddReminder();
  const updateMutation = useUpdateReminder();

  const isEditing = !!editReminder;

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — reinitialize only when open/id changes
  useEffect(() => {
    if (!open) {
      setForm(defaultForm);
      setErrors({});
      return;
    }
    if (editReminder) {
      setForm({
        medicineName: editReminder.medicineName,
        dosage: editReminder.dosage,
        times:
          editReminder.reminderTimes.length > 0
            ? editReminder.reminderTimes.map(nsToTime)
            : ["08:00"],
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [open, editReminder?.id]);

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const setTime = (index: number, value: string) => {
    setForm((prev) => {
      const times = [...prev.times];
      times[index] = value;
      return { ...prev, times };
    });
  };

  const addTime = () => {
    setForm((prev) => ({ ...prev, times: [...prev.times, "12:00"] }));
  };

  const removeTime = (index: number) => {
    if (form.times.length === 1) return;
    setForm((prev) => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!form.medicineName.trim())
      newErrors.medicineName = "Medicine name is required";
    if (!form.dosage.trim()) newErrors.dosage = "Dosage is required";
    if (form.times.length === 0 || form.times.every((t) => !t))
      newErrors.times = "At least one reminder time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const reminderTimes = form.times.map(timeToNs);

    if (isEditing && editReminder) {
      updateMutation.mutate(
        {
          id: editReminder.id,
          medicineName: form.medicineName.trim(),
          dosage: form.dosage.trim(),
          reminderTimes,
        },
        {
          onSuccess: () => {
            toast.success(`${form.medicineName} reminder updated`);
            handleClose();
          },
          onError: () => toast.error("Failed to update reminder"),
        },
      );
    } else {
      addMutation.mutate(
        {
          medicineName: form.medicineName.trim(),
          dosage: form.dosage.trim(),
          reminderTimes,
        },
        {
          onSuccess: () => {
            toast.success(`${form.medicineName} reminder added`);
            handleClose();
          },
          onError: () => toast.error("Failed to add reminder"),
        },
      );
    }
  };

  const handleClose = () => {
    setForm(defaultForm);
    setErrors({});
    onClose();
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent
        side="bottom"
        data-ocid="medicines.add_reminder.dialog"
        className="rounded-t-2xl max-h-[88dvh] overflow-y-auto px-4 pb-8"
      >
        <SheetHeader className="mb-5 pt-1">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-display font-bold">
              {isEditing ? "Edit Reminder" : "Add Reminder"}
            </SheetTitle>
            <button
              type="button"
              data-ocid="medicines.add_reminder.close_button"
              onClick={handleClose}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-muted tap-highlight-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </SheetHeader>

        <div className="space-y-4">
          {/* Medicine Name */}
          <div>
            <label
              htmlFor="rem-medicine-name"
              className="block text-sm font-display font-medium text-foreground mb-1.5"
            >
              Medicine Name <span className="text-destructive">*</span>
            </label>
            <input
              id="rem-medicine-name"
              type="text"
              data-ocid="medicines.add_reminder.medicine_name_input"
              value={form.medicineName}
              onChange={(e) => set("medicineName", e.target.value)}
              placeholder="e.g. Metformin"
              className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.medicineName && (
              <p
                data-ocid="medicines.add_reminder.medicine_name_input.field_error"
                className="mt-1 text-xs text-destructive"
              >
                {errors.medicineName}
              </p>
            )}
          </div>

          {/* Dosage */}
          <div>
            <label
              htmlFor="rem-dosage"
              className="block text-sm font-display font-medium text-foreground mb-1.5"
            >
              Dosage <span className="text-destructive">*</span>
            </label>
            <input
              id="rem-dosage"
              type="text"
              data-ocid="medicines.add_reminder.dosage_input"
              value={form.dosage}
              onChange={(e) => set("dosage", e.target.value)}
              placeholder="e.g. 500mg"
              className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.dosage && (
              <p
                data-ocid="medicines.add_reminder.dosage_input.field_error"
                className="mt-1 text-xs text-destructive"
              >
                {errors.dosage}
              </p>
            )}
          </div>

          {/* Reminder times */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-display font-medium text-foreground">
                Reminder Times <span className="text-destructive">*</span>
              </span>
              <button
                type="button"
                data-ocid="medicines.add_reminder.add_time_button"
                onClick={addTime}
                className="flex items-center gap-1 text-xs font-medium text-primary tap-highlight-none py-1 px-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Add time
              </button>
            </div>
            <div className="space-y-2">
              {form.times.map((time, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: time entries have no stable id
                <div key={`time-${i}`} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1 h-12 px-3 rounded-xl border border-input bg-background">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <label htmlFor={`rem-time-${i}`} className="sr-only">
                      Reminder time {i + 1}
                    </label>
                    <input
                      id={`rem-time-${i}`}
                      type="time"
                      data-ocid={`medicines.add_reminder.time_input.${i + 1}`}
                      value={time}
                      onChange={(e) => setTime(i, e.target.value)}
                      className="flex-1 bg-transparent text-foreground text-sm focus:outline-none"
                    />
                  </div>
                  {form.times.length > 1 && (
                    <button
                      type="button"
                      data-ocid={`medicines.add_reminder.remove_time_button.${i + 1}`}
                      onClick={() => removeTime(i)}
                      aria-label="Remove time"
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors tap-highlight-none shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.times && (
              <p
                data-ocid="medicines.add_reminder.times.field_error"
                className="mt-1 text-xs text-destructive"
              >
                {errors.times}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <button
            type="button"
            data-ocid="medicines.add_reminder.submit_button"
            onClick={handleSubmit}
            disabled={isPending}
            style={{ minHeight: 52 }}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl text-sm font-display font-semibold transition-smooth active:scale-[0.98] tap-highlight-none disabled:opacity-60"
          >
            {isPending
              ? "Saving..."
              : isEditing
                ? "Update Reminder"
                : "Save Reminder"}
          </button>
          <button
            type="button"
            data-ocid="medicines.add_reminder.cancel_button"
            onClick={handleClose}
            className="w-full h-11 flex items-center justify-center rounded-xl border border-border text-sm text-muted-foreground transition-smooth active:scale-[0.98] tap-highlight-none"
          >
            Cancel
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
