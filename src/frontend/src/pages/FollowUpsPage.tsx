import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  type FollowUp,
  Variant_scheduled_rescheduled_completed,
  useAddFollowUp,
  useCompleteFollowUp,
  useDeleteFollowUp,
  useFollowUps,
  useRescheduleFollowUp,
} from "@/hooks/use-health-data";
import {
  dateToNs,
  formatDate,
  getRelativeDateLabel,
  isWithinDays,
  nsToDate,
} from "@/lib/backend-client";
import {
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  Plus,
  Stethoscope,
  Trash2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Status config ────────────────────────────────────────────────────────────
type BackendFollowUpStatus = Variant_scheduled_rescheduled_completed;
const V = Variant_scheduled_rescheduled_completed;

const statusConfig: Record<
  BackendFollowUpStatus,
  { label: string; badgeClass: string }
> = {
  [V.scheduled]: {
    label: "Scheduled",
    badgeClass: "border-primary/30 text-primary bg-primary/5",
  },
  [V.rescheduled]: {
    label: "Rescheduled",
    badgeClass: "border-accent/30 text-accent bg-accent/5",
  },
  [V.completed]: {
    label: "Completed",
    badgeClass: "border-secondary/30 text-secondary bg-secondary/5",
  },
};

// ─── Urgency helpers ──────────────────────────────────────────────────────────
function getUrgencyClass(
  scheduledDate: bigint,
  status: BackendFollowUpStatus,
): string {
  if (status !== V.scheduled && status !== V.rescheduled) return "";
  if (isWithinDays(scheduledDate, 3))
    return "border-destructive/40 bg-destructive/5";
  if (isWithinDays(scheduledDate, 7)) return "border-accent/40 bg-accent/5";
  return "";
}

function friendlyDate(ns: bigint): string {
  return nsToDate(ns).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

// ─── Add Follow-Up Modal ──────────────────────────────────────────────────────
function AddFollowUpModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const addMutation = useAddFollowUp();
  const [doctorName, setDoctorName] = useState("");
  const [department, setDepartment] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim() || !dateStr) return;
    const scheduledDate = dateToNs(new Date(dateStr));
    addMutation.mutate(
      {
        doctorName: doctorName.trim(),
        department: department.trim(),
        scheduledDate,
        notes: notes.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Follow-up scheduled!");
          setDoctorName("");
          setDepartment("");
          setDateStr("");
          setNotes("");
          onClose();
        },
        onError: () => toast.error("Failed to schedule follow-up"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="followups.add_dialog"
        className="max-w-sm mx-auto rounded-2xl p-0 overflow-hidden"
      >
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
          <DialogTitle className="font-display text-base font-semibold text-foreground">
            Schedule Follow-Up
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fu-doctor" className="text-xs font-medium">
              Doctor Name *
            </Label>
            <Input
              id="fu-doctor"
              data-ocid="followups.doctor_input"
              placeholder="e.g. Dr. Sarah Williams"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fu-department" className="text-xs font-medium">
              Department / Specialty
            </Label>
            <Input
              id="fu-department"
              data-ocid="followups.specialty_input"
              placeholder="e.g. Cardiology"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fu-date" className="text-xs font-medium">
              Appointment Date *
            </Label>
            <Input
              id="fu-date"
              data-ocid="followups.date_input"
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="h-11"
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fu-notes" className="text-xs font-medium">
              Notes
            </Label>
            <Textarea
              id="fu-notes"
              data-ocid="followups.notes_textarea"
              placeholder="e.g. Bring recent blood pressure readings"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none min-h-[80px]"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11"
              data-ocid="followups.add_cancel_button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11"
              data-ocid="followups.add_submit_button"
              disabled={addMutation.isPending}
            >
              {addMutation.isPending ? "Saving…" : "Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reschedule Modal ─────────────────────────────────────────────────────────
function RescheduleModal({
  followUp,
  onClose,
}: {
  followUp: FollowUp | null;
  onClose: () => void;
}) {
  const rescheduleMutation = useRescheduleFollowUp();
  const [dateStr, setDateStr] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUp || !dateStr) return;
    rescheduleMutation.mutate(
      { id: followUp.id, newDate: dateToNs(new Date(dateStr)) },
      {
        onSuccess: () => {
          toast.success("Appointment rescheduled");
          setDateStr("");
          onClose();
        },
        onError: () => toast.error("Failed to reschedule"),
      },
    );
  };

  return (
    <Dialog open={!!followUp} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="followups.reschedule_dialog"
        className="max-w-sm mx-auto rounded-2xl p-0 overflow-hidden"
      >
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
          <DialogTitle className="font-display text-base font-semibold text-foreground">
            Reschedule Appointment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {followUp && (
            <p className="text-sm text-muted-foreground">
              Rescheduling appointment with{" "}
              <span className="font-semibold text-foreground">
                {followUp.doctorName}
              </span>
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="reschedule-date" className="text-xs font-medium">
              New Date *
            </Label>
            <Input
              id="reschedule-date"
              data-ocid="followups.reschedule_date_input"
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="h-11"
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11"
              data-ocid="followups.reschedule_cancel_button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11"
              data-ocid="followups.reschedule_confirm_button"
              disabled={rescheduleMutation.isPending}
            >
              {rescheduleMutation.isPending ? "Saving…" : "Reschedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteConfirmModal({
  followUp,
  onClose,
}: {
  followUp: FollowUp | null;
  onClose: () => void;
}) {
  const deleteMutation = useDeleteFollowUp();

  const handleDelete = () => {
    if (!followUp) return;
    deleteMutation.mutate(followUp.id, {
      onSuccess: () => {
        toast.success("Appointment removed");
        onClose();
      },
      onError: () => toast.error("Failed to delete"),
    });
  };

  return (
    <Dialog open={!!followUp} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="followups.delete_dialog"
        className="max-w-sm mx-auto rounded-2xl p-5"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground text-base">
              Delete appointment?
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              This will permanently remove your appointment with{" "}
              <span className="font-medium text-foreground">
                {followUp?.doctorName}
              </span>
              .
            </p>
          </div>
          <div className="flex gap-2 w-full pt-2">
            <Button
              variant="outline"
              className="flex-1 h-11"
              data-ocid="followups.delete_cancel_button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 h-11"
              data-ocid="followups.delete_confirm_button"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Urgency Alert Banner ─────────────────────────────────────────────────────
function UrgencyBanner({ followUps }: { followUps: FollowUp[] }) {
  const urgent = followUps.filter(
    (f) =>
      (f.status === V.scheduled || f.status === V.rescheduled) &&
      isWithinDays(f.scheduledDate, 3),
  );
  if (!urgent.length) return null;
  const fu = urgent[0];
  const label = getRelativeDateLabel(fu.scheduledDate).toLowerCase();
  const message =
    label === "today"
      ? `Your appointment with ${fu.doctorName} is today!`
      : `Your appointment with ${fu.doctorName} is ${label}!`;

  return (
    <motion.div
      data-ocid="followups.urgency_banner"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4 flex items-start gap-2.5 bg-destructive/8 border border-destructive/30 rounded-xl px-4 py-3"
    >
      <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
      <p className="text-xs font-medium text-destructive leading-relaxed">
        {message}
      </p>
    </motion.div>
  );
}

// ─── Follow-Up Card (Upcoming) ────────────────────────────────────────────────
function UpcomingCard({
  fu,
  index,
  onComplete,
  onReschedule,
  onDelete,
  isCompleting,
}: {
  fu: FollowUp;
  index: number;
  onComplete: (id: bigint) => void;
  onReschedule: (fu: FollowUp) => void;
  onDelete: (fu: FollowUp) => void;
  isCompleting: boolean;
}) {
  const urgencyClass = getUrgencyClass(fu.scheduledDate, fu.status);
  const isUrgent = isWithinDays(fu.scheduledDate, 3);
  const isAmber = !isUrgent && isWithinDays(fu.scheduledDate, 7);
  const dateLabel = getRelativeDateLabel(fu.scheduledDate);

  return (
    <motion.div
      data-ocid={`followups.upcoming.item.${index + 1}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className={`bg-card border rounded-xl p-4 shadow-xs transition-smooth ${urgencyClass || "border-border"}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            isUrgent
              ? "bg-destructive/10"
              : isAmber
                ? "bg-accent/10"
                : "bg-primary/10"
          }`}
        >
          <Stethoscope
            className={`w-5 h-5 ${
              isUrgent
                ? "text-destructive"
                : isAmber
                  ? "text-accent"
                  : "text-primary"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-display font-bold text-foreground truncate">
                {fu.doctorName}
              </p>
              {fu.department && (
                <p className="text-xs text-muted-foreground">{fu.department}</p>
              )}
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] shrink-0 whitespace-nowrap ${
                isUrgent
                  ? "border-destructive/40 text-destructive bg-destructive/5"
                  : isAmber
                    ? "border-accent/40 text-accent bg-accent/5"
                    : statusConfig[V.scheduled].badgeClass
              }`}
            >
              {dateLabel}
            </Badge>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 shrink-0" />
              {friendlyDate(fu.scheduledDate)}
            </span>
          </div>

          {fu.notes && (
            <p className="mt-1.5 text-xs text-muted-foreground italic line-clamp-2 leading-relaxed">
              {fu.notes}
            </p>
          )}

          <div className="mt-3 flex gap-2 flex-wrap">
            <Button
              data-ocid={`followups.complete_button.${index + 1}`}
              size="sm"
              variant="outline"
              className="h-9 text-xs gap-1.5 border-secondary/30 text-secondary hover:bg-secondary/10 min-w-[7rem]"
              onClick={() => onComplete(fu.id)}
              disabled={isCompleting}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Done
            </Button>
            <Button
              data-ocid={`followups.reschedule_button.${index + 1}`}
              size="sm"
              variant="outline"
              className="h-9 text-xs gap-1.5 min-w-[7rem]"
              onClick={() => onReschedule(fu)}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              Reschedule
            </Button>
            <Button
              data-ocid={`followups.delete_button.${index + 1}`}
              size="sm"
              variant="ghost"
              className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              aria-label="Delete appointment"
              onClick={() => onDelete(fu)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Follow-Up Card (All/Past) ────────────────────────────────────────────────
function AllCard({
  fu,
  index,
  onDelete,
}: {
  fu: FollowUp;
  index: number;
  onDelete: (fu: FollowUp) => void;
}) {
  const config = statusConfig[fu.status];
  return (
    <motion.div
      data-ocid={`followups.all.item.${index + 1}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-card border border-border rounded-xl p-4 shadow-xs"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
          {fu.status === V.completed ? (
            <CheckCircle2 className="w-5 h-5 text-secondary" />
          ) : fu.status === V.rescheduled ? (
            <CalendarClock className="w-5 h-5 text-accent" />
          ) : (
            <Stethoscope className="w-5 h-5 text-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-display font-bold text-foreground truncate">
              {fu.doctorName}
            </p>
            <Badge
              variant="outline"
              className={`text-[10px] shrink-0 ${config.badgeClass}`}
            >
              {config.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {fu.department && `${fu.department} · `}
            {formatDate(fu.scheduledDate, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
          {fu.notes && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-1 italic">
              {fu.notes}
            </p>
          )}
        </div>

        <button
          data-ocid={`followups.all.delete_button.${index + 1}`}
          type="button"
          aria-label="Delete appointment"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth shrink-0 mt-0.5"
          onClick={() => onDelete(fu)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onAdd, label }: { onAdd: () => void; label: string }) {
  return (
    <div
      data-ocid="followups.empty_state"
      className="flex flex-col items-center py-16 text-center px-4"
    >
      <div className="w-20 h-20 rounded-3xl bg-primary/8 flex items-center justify-center mb-5">
        <CalendarCheck className="w-10 h-10 text-primary" />
      </div>
      <p className="text-base font-display font-bold text-foreground mb-2">
        {label}
      </p>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-8">
        Schedule your doctor appointments and get reminded so you never miss a
        visit.
      </p>
      <Button
        data-ocid="followups.empty_add_button"
        className="h-12 px-6 gap-2"
        onClick={onAdd}
      >
        <Plus className="w-4 h-4" />
        Schedule Appointment
      </Button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3" data-ocid="followups.loading_state">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-36 rounded-xl" />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function FollowUpsPage() {
  const { data: followUps, isLoading } = useFollowUps();
  const completeMutation = useCompleteFollowUp();

  const [addOpen, setAddOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<FollowUp | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<FollowUp | null>(null);

  const upcoming =
    followUps?.filter(
      (f) => f.status === V.scheduled || f.status === V.rescheduled,
    ) ?? [];
  const within30 = upcoming.filter((f) => isWithinDays(f.scheduledDate, 30));
  const all = followUps ?? [];

  const sortedUpcoming = [...within30].sort((a, b) =>
    Number(a.scheduledDate - b.scheduledDate),
  );
  const sortedAll = [...all].sort((a, b) =>
    Number(b.scheduledDate - a.scheduledDate),
  );

  const handleComplete = (id: bigint) => {
    completeMutation.mutate(id, {
      onSuccess: () => toast.success("Appointment marked as done"),
      onError: () => toast.error("Failed to update appointment"),
    });
  };

  const header = (
    <div className="flex items-center justify-between">
      <h1 className="text-lg font-display font-bold text-foreground">
        Follow-ups
      </h1>
      <Button
        data-ocid="followups.add_button"
        size="sm"
        className="h-9 gap-1.5"
        onClick={() => setAddOpen(true)}
      >
        <Plus className="w-4 h-4" />
        Schedule
      </Button>
    </div>
  );

  return (
    <Layout header={header}>
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <Tabs defaultValue="upcoming" data-ocid="followups.tabs">
          <TabsList className="w-full mb-4">
            <TabsTrigger
              data-ocid="followups.upcoming_tab"
              value="upcoming"
              className="flex-1"
            >
              Upcoming
              {sortedUpcoming.length > 0 && (
                <span className="ml-1.5 min-w-[1.25rem] h-5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold inline-flex items-center justify-center px-1">
                  {sortedUpcoming.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              data-ocid="followups.all_tab"
              value="all"
              className="flex-1"
            >
              All
              {sortedAll.length > 0 && (
                <span className="ml-1.5 min-w-[1.25rem] h-5 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold inline-flex items-center justify-center px-1">
                  {sortedAll.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-0">
            <UrgencyBanner followUps={upcoming} />
            {sortedUpcoming.length === 0 ? (
              <EmptyState
                label="No upcoming appointments"
                onAdd={() => setAddOpen(true)}
              />
            ) : (
              <div className="space-y-3">
                {sortedUpcoming.map((fu, i) => (
                  <UpcomingCard
                    key={fu.id.toString()}
                    fu={fu}
                    index={i}
                    onComplete={handleComplete}
                    onReschedule={setRescheduleTarget}
                    onDelete={setDeleteTarget}
                    isCompleting={completeMutation.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-0">
            {sortedAll.length === 0 ? (
              <EmptyState
                label="No follow-ups yet"
                onAdd={() => setAddOpen(true)}
              />
            ) : (
              <div className="space-y-3">
                {sortedAll.map((fu, i) => (
                  <AllCard
                    key={fu.id.toString()}
                    fu={fu}
                    index={i}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <button
        data-ocid="followups.fab_button"
        type="button"
        aria-label="Schedule new appointment"
        onClick={() => setAddOpen(true)}
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-elevated flex items-center justify-center transition-smooth hover:bg-primary/90 active:scale-95 tap-highlight-none z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      <AddFollowUpModal open={addOpen} onClose={() => setAddOpen(false)} />
      <RescheduleModal
        followUp={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
      />
      <DeleteConfirmModal
        followUp={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </Layout>
  );
}
