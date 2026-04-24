import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type Prescription,
  PrescriptionStatus,
  usePrescriptions,
  useTogglePrescriptionStatus,
} from "@/hooks/use-health-data";
import { formatDate } from "@/lib/backend-client";
import {
  ChevronRight,
  FileText,
  Pill,
  Plus,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { PrescriptionDetailSheet } from "./PrescriptionDetailSheet";

const statusStyles: Record<PrescriptionStatus, string> = {
  [PrescriptionStatus.active]:
    "bg-secondary/10 text-secondary border-secondary/20",
  [PrescriptionStatus.inactive]: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<PrescriptionStatus, string> = {
  [PrescriptionStatus.active]: "Active",
  [PrescriptionStatus.inactive]: "Inactive",
};

function PrescriptionCard({
  rx,
  index,
  onTap,
}: {
  rx: Prescription;
  index: number;
  onTap: (rx: Prescription) => void;
}) {
  const toggleMutation = useTogglePrescriptionStatus();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus =
      rx.status === PrescriptionStatus.active
        ? PrescriptionStatus.inactive
        : PrescriptionStatus.active;
    toggleMutation.mutate(
      { id: rx.id, status: newStatus },
      {
        onSuccess: () =>
          toast.success(
            `${rx.medicineName} marked as ${statusLabels[newStatus]}`,
          ),
        onError: () => toast.error("Failed to update status"),
      },
    );
  };

  return (
    <motion.button
      type="button"
      data-ocid={`medicines.prescription.item.${index + 1}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      onClick={() => onTap(rx)}
      className="w-full text-left bg-card border border-border rounded-xl p-4 shadow-xs active:scale-[0.99] transition-smooth tap-highlight-none"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Pill className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-display font-semibold text-foreground truncate">
              {rx.medicineName}
            </p>
            <p className="text-xs text-muted-foreground">
              {rx.dosage} · {rx.frequency}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="outline"
            className={`text-[10px] ${statusStyles[rx.status]}`}
          >
            {statusLabels[rx.status]}
          </Badge>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Notes */}
      {rx.notes && (
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2">
          {rx.notes}
        </p>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground min-w-0">
          <span className="shrink-0">From {formatDate(rx.startDate)}</span>
          {rx.endDate && (
            <>
              <span>·</span>
              <span className="shrink-0">Until {formatDate(rx.endDate)}</span>
            </>
          )}
        </div>
        {/* Toggle status */}
        <button
          type="button"
          data-ocid={`medicines.prescription.toggle.${index + 1}`}
          onClick={handleToggle}
          disabled={toggleMutation.isPending}
          aria-label={`Mark as ${rx.status === PrescriptionStatus.active ? "inactive" : "active"}`}
          className="shrink-0 flex items-center gap-1 h-8 px-2.5 rounded-lg border border-border text-xs font-medium transition-smooth active:scale-95 tap-highlight-none disabled:opacity-50"
        >
          {rx.status === PrescriptionStatus.active ? (
            <ToggleRight className="w-4 h-4 text-secondary" />
          ) : (
            <ToggleLeft className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-muted-foreground">
            {statusLabels[rx.status]}
          </span>
        </button>
      </div>

      {/* Document indicator */}
      {rx.documentRef && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-primary">
          <FileText className="w-3.5 h-3.5" />
          <span className="truncate">Document attached</span>
        </div>
      )}
    </motion.button>
  );
}

export function PrescriptionsTab({ onAdd }: { onAdd: () => void }) {
  const { data: prescriptions, isLoading } = usePrescriptions();
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!prescriptions?.length) {
    return (
      <div
        data-ocid="medicines.prescriptions.empty_state"
        className="flex flex-col items-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Pill className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-base font-display font-semibold text-foreground mb-1">
          No prescriptions yet
        </p>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
          Add your prescriptions to keep all your medication information in one
          place.
        </p>
        <button
          type="button"
          data-ocid="medicines.add_prescription_empty_button"
          onClick={onAdd}
          className="flex items-center justify-center gap-2 h-12 px-6 bg-primary text-primary-foreground rounded-xl text-sm font-display font-semibold transition-smooth active:scale-95 tap-highlight-none"
        >
          <Plus className="w-4 h-4" />
          Add Prescription
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3" data-ocid="medicines.prescriptions_list">
        {prescriptions.map((rx, i) => (
          <PrescriptionCard
            key={rx.id.toString()}
            rx={rx}
            index={i}
            onTap={setSelectedRx}
          />
        ))}
      </div>

      <PrescriptionDetailSheet
        prescription={selectedRx}
        onClose={() => setSelectedRx(null)}
      />
    </>
  );
}
