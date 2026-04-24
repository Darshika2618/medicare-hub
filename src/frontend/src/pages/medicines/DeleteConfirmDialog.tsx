import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  medicineName: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  open,
  medicineName,
  isPending,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent
        data-ocid="medicines.delete_reminder.dialog"
        className="mx-4 rounded-2xl"
      >
        <AlertDialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mx-auto mb-2">
            <Trash2 className="w-6 h-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center text-base font-display font-bold">
            Delete Reminder?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm text-muted-foreground">
            This will permanently delete the{" "}
            <span className="font-medium text-foreground">{medicineName}</span>{" "}
            reminder. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <button
            type="button"
            data-ocid="medicines.delete_reminder.confirm_button"
            onClick={onConfirm}
            disabled={isPending}
            className="w-full h-12 flex items-center justify-center gap-2 bg-destructive text-destructive-foreground rounded-xl text-sm font-display font-semibold transition-smooth active:scale-[0.98] tap-highlight-none disabled:opacity-60"
          >
            {isPending ? "Deleting..." : "Yes, Delete Reminder"}
          </button>
          <button
            type="button"
            data-ocid="medicines.delete_reminder.cancel_button"
            onClick={onCancel}
            className="w-full h-11 flex items-center justify-center rounded-xl border border-border text-sm text-muted-foreground transition-smooth active:scale-[0.98] tap-highlight-none"
          >
            Keep Reminder
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
