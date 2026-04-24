import { ExternalBlob } from "@/backend";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAddPrescription } from "@/hooks/use-health-data";
import { dateToNs } from "@/lib/backend-client";
import { Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface FormState {
  medicineName: string;
  dosage: string;
  frequency: string;
  notes: string;
  startDate: string;
  endDate: string;
}

const defaultForm: FormState = {
  medicineName: "",
  dosage: "",
  frequency: "once_daily",
  notes: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
};

const frequencyOptions = [
  { value: "once_daily", label: "Once daily" },
  { value: "twice_daily", label: "Twice daily" },
  { value: "three_times_daily", label: "Three times daily" },
  { value: "as_needed", label: "As needed" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddPrescriptionSheet({ open, onClose }: Props) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMutation = useAddPrescription();

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.medicineName.trim())
      newErrors.medicineName = "Medicine name is required";
    if (!form.dosage.trim()) newErrors.dosage = "Dosage is required";
    if (!form.startDate) newErrors.startDate = "Start date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    let documentRef: ExternalBlob | undefined;
    if (uploadFile) {
      const bytes = new Uint8Array(await uploadFile.arrayBuffer());
      documentRef = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
    }

    const startDate = dateToNs(new Date(`${form.startDate}T12:00:00`));
    const endDate = form.endDate
      ? dateToNs(new Date(`${form.endDate}T12:00:00`))
      : undefined;

    addMutation.mutate(
      {
        medicineName: form.medicineName.trim(),
        dosage: form.dosage.trim(),
        frequency: form.frequency,
        notes: form.notes.trim(),
        startDate,
        endDate,
        documentRef,
      },
      {
        onSuccess: () => {
          toast.success(`${form.medicineName} prescription added!`);
          handleClose();
        },
        onError: () => toast.error("Failed to save prescription"),
      },
    );
  };

  const handleClose = () => {
    setForm(defaultForm);
    setErrors({});
    setUploadFile(null);
    setUploadProgress(0);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent
        side="bottom"
        data-ocid="medicines.add_prescription.dialog"
        className="rounded-t-2xl max-h-[92dvh] overflow-y-auto px-4 pb-8"
      >
        <SheetHeader className="mb-5 pt-1">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-display font-bold">
              Add Prescription
            </SheetTitle>
            <button
              type="button"
              data-ocid="medicines.add_prescription.close_button"
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
              htmlFor="rx-medicine-name"
              className="block text-sm font-display font-medium text-foreground mb-1.5"
            >
              Medicine Name <span className="text-destructive">*</span>
            </label>
            <input
              id="rx-medicine-name"
              type="text"
              data-ocid="medicines.add_prescription.medicine_name_input"
              value={form.medicineName}
              onChange={(e) => set("medicineName", e.target.value)}
              placeholder="e.g. Atorvastatin"
              className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.medicineName && (
              <p
                data-ocid="medicines.add_prescription.medicine_name_input.field_error"
                className="mt-1 text-xs text-destructive"
              >
                {errors.medicineName}
              </p>
            )}
          </div>

          {/* Dosage */}
          <div>
            <label
              htmlFor="rx-dosage"
              className="block text-sm font-display font-medium text-foreground mb-1.5"
            >
              Dosage <span className="text-destructive">*</span>
            </label>
            <input
              id="rx-dosage"
              type="text"
              data-ocid="medicines.add_prescription.dosage_input"
              value={form.dosage}
              onChange={(e) => set("dosage", e.target.value)}
              placeholder="e.g. 40mg"
              className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.dosage && (
              <p
                data-ocid="medicines.add_prescription.dosage_input.field_error"
                className="mt-1 text-xs text-destructive"
              >
                {errors.dosage}
              </p>
            )}
          </div>

          {/* Frequency */}
          <div>
            <label
              htmlFor="rx-frequency"
              className="block text-sm font-display font-medium text-foreground mb-1.5"
            >
              Frequency
            </label>
            <select
              id="rx-frequency"
              data-ocid="medicines.add_prescription.frequency_select"
              value={form.frequency}
              onChange={(e) => set("frequency", e.target.value)}
              className="w-full h-12 px-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {frequencyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="rx-start-date"
                className="block text-sm font-display font-medium text-foreground mb-1.5"
              >
                Start Date <span className="text-destructive">*</span>
              </label>
              <input
                id="rx-start-date"
                type="date"
                data-ocid="medicines.add_prescription.start_date_input"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className="w-full h-12 px-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.startDate && (
                <p
                  data-ocid="medicines.add_prescription.start_date_input.field_error"
                  className="mt-1 text-xs text-destructive"
                >
                  {errors.startDate}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="rx-end-date"
                className="block text-sm font-display font-medium text-foreground mb-1.5"
              >
                End Date
              </label>
              <input
                id="rx-end-date"
                type="date"
                data-ocid="medicines.add_prescription.end_date_input"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className="w-full h-12 px-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="rx-notes"
              className="block text-sm font-display font-medium text-foreground mb-1.5"
            >
              Notes (optional)
            </label>
            <textarea
              id="rx-notes"
              data-ocid="medicines.add_prescription.notes_textarea"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Additional notes..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* File upload */}
          <div>
            <label
              htmlFor="rx-file-input"
              className="block text-sm font-display font-medium text-foreground mb-1.5"
            >
              Upload Document (optional)
            </label>
            <input
              id="rx-file-input"
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="sr-only"
              data-ocid="medicines.add_prescription.file_input"
            />
            <button
              type="button"
              data-ocid="medicines.add_prescription.upload_button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors tap-highlight-none"
            >
              <Paperclip className="w-4 h-4" />
              {uploadFile
                ? uploadFile.name
                : "Attach prescription image or PDF"}
            </button>
            {uploadFile && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6 space-y-2">
          <button
            type="button"
            data-ocid="medicines.add_prescription.submit_button"
            onClick={handleSubmit}
            disabled={addMutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl text-sm font-display font-semibold transition-smooth active:scale-[0.98] tap-highlight-none disabled:opacity-60"
            style={{ minHeight: 52 }}
          >
            {addMutation.isPending ? "Saving..." : "Save Prescription"}
          </button>
          <button
            type="button"
            data-ocid="medicines.add_prescription.cancel_button"
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
