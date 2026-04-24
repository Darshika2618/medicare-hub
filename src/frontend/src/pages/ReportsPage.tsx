import { ExternalBlob, Variant_lab_other_imaging } from "@/backend";
import type { Report } from "@/backend";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddReport,
  useDeleteReport,
  useReports,
} from "@/hooks/use-health-data";
import { dateToNs, formatDate } from "@/lib/backend-client";
import {
  AlertTriangle,
  Calendar,
  Download,
  FileText,
  FlaskConical,
  ImageIcon,
  Paperclip,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// ── Type helpers ────────────────────────────────────────────

type BackendReportType = Variant_lab_other_imaging;

const REPORT_TYPE_CONFIG: Record<
  BackendReportType,
  {
    label: string;
    Icon: React.ElementType;
    badgeClass: string;
    iconBg: string;
    iconColor: string;
  }
> = {
  [Variant_lab_other_imaging.lab]: {
    label: "Lab Results",
    Icon: FlaskConical,
    badgeClass: "border-primary/30 text-primary bg-primary/8",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  [Variant_lab_other_imaging.imaging]: {
    label: "Imaging",
    Icon: ImageIcon,
    badgeClass: "border-secondary/30 text-secondary bg-secondary/8",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  [Variant_lab_other_imaging.other]: {
    label: "Document",
    Icon: FileText,
    badgeClass: "border-border text-muted-foreground bg-muted/60",
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
};

// ── Upload Form Dialog ───────────────────────────────────────

interface UploadFormProps {
  open: boolean;
  onClose: () => void;
}

function UploadReportDialog({ open, onClose }: UploadFormProps) {
  const [reportType, setReportType] = useState<BackendReportType>(
    Variant_lab_other_imaging.lab,
  );
  const [reportDate, setReportDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addReport = useAddReport();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    const bytes = new Uint8Array(await selectedFile.arrayBuffer());
    const fileRef = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
      setUploadProgress(pct);
    });

    const dateObj = new Date(`${reportDate}T12:00:00`);
    const reportDateNs = dateToNs(dateObj);

    addReport.mutate(
      { reportType, reportDate: reportDateNs, notes, fileRef },
      {
        onSuccess: () => {
          toast.success("Report uploaded successfully");
          handleClose();
        },
        onError: () => {
          toast.error("Failed to upload report");
          setUploadProgress(0);
        },
      },
    );
  };

  const handleClose = () => {
    setReportType(Variant_lab_other_imaging.lab);
    setReportDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setSelectedFile(null);
    setUploadProgress(0);
    onClose();
  };

  const isPending = addReport.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        data-ocid="reports.upload_dialog"
        className="max-w-sm mx-auto rounded-2xl p-0 gap-0"
      >
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-display font-bold text-foreground">
            Upload Report
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
          {/* Report Type */}
          <div className="space-y-1.5">
            <Label htmlFor="report-type" className="text-xs font-medium">
              Report Type
            </Label>
            <Select
              value={reportType}
              onValueChange={(v) => setReportType(v as BackendReportType)}
              disabled={isPending}
            >
              <SelectTrigger
                id="report-type"
                data-ocid="reports.type_select"
                className="h-11"
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Variant_lab_other_imaging.lab}>
                  Lab Results
                </SelectItem>
                <SelectItem value={Variant_lab_other_imaging.imaging}>
                  Imaging
                </SelectItem>
                <SelectItem value={Variant_lab_other_imaging.other}>
                  Other Document
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Report Date */}
          <div className="space-y-1.5">
            <Label htmlFor="report-date" className="text-xs font-medium">
              Report Date
            </Label>
            <input
              id="report-date"
              type="date"
              data-ocid="reports.date_input"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              disabled={isPending}
              required
              className="w-full h-11 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="report-notes" className="text-xs font-medium">
              Notes{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="report-notes"
              data-ocid="reports.notes_textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending}
              placeholder="E.g. HbA1c results from Dr. Smith…"
              className="min-h-[72px] resize-none text-sm"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              File{" "}
              <span className="text-destructive" aria-hidden>
                *
              </span>
            </Label>
            <button
              type="button"
              data-ocid="reports.file_upload_button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              className="w-full h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-muted/30 hover:bg-primary/5 transition-smooth flex flex-col items-center justify-center gap-1.5 text-muted-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedFile ? (
                <>
                  <Paperclip className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-foreground truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                  <span className="text-[10px]">
                    {(selectedFile.size / 1024).toFixed(0)} KB — tap to change
                  </span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span className="text-xs font-medium">
                    Tap to select file
                  </span>
                  <span className="text-[10px]">PDF, image, or document</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.txt"
              onChange={handleFileChange}
              tabIndex={-1}
              className="sr-only"
            />
          </div>

          {/* Upload progress */}
          {isPending && uploadProgress > 0 && uploadProgress < 100 && (
            <div data-ocid="reports.upload_progress" className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              data-ocid="reports.upload_cancel_button"
              onClick={handleClose}
              disabled={isPending}
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="reports.upload_submit_button"
              disabled={isPending || !selectedFile}
              className="flex-1 h-11"
            >
              {isPending ? "Uploading…" : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Report Detail Dialog ─────────────────────────────────────

interface DetailDialogProps {
  report: Report | null;
  onClose: () => void;
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
}

function ReportDetailDialog({
  report,
  onClose,
  onDelete,
  isDeleting,
}: DetailDialogProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!report) return null;

  const config = REPORT_TYPE_CONFIG[report.reportType];
  const Icon = config.Icon;

  const handleDownload = async () => {
    try {
      const bytes = await report.fileRef.getBytes();
      const blob = new Blob([bytes]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${report.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download file");
    }
  };

  const handleDeleteConfirm = () => {
    onDelete(report.id);
    setConfirmDelete(false);
  };

  return (
    <Dialog open={!!report} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="reports.detail_dialog"
        className="max-w-sm mx-auto rounded-2xl p-0 gap-0"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-start gap-3">
            <div
              className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0`}
            >
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <Badge
                variant="outline"
                className={`text-[10px] mb-1 ${config.badgeClass}`}
              >
                {config.label}
              </Badge>
              <p className="text-sm font-display font-semibold text-foreground leading-snug line-clamp-2">
                {report.notes || config.label}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>
              Report date:{" "}
              <span className="text-foreground font-medium">
                {formatDate(report.reportDate)}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0 opacity-0" />
            <span>
              Added:{" "}
              <span className="text-foreground font-medium">
                {formatDate(report.createdAt)}
              </span>
            </span>
          </div>

          {report.notes && (
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Notes
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {report.notes}
              </p>
            </div>
          )}

          {/* File action */}
          <Button
            variant="outline"
            data-ocid="reports.download_button"
            onClick={handleDownload}
            className="w-full h-11 gap-2 border-primary/30 text-primary hover:bg-primary/5"
          >
            <Download className="w-4 h-4" />
            View / Download File
          </Button>
        </div>

        {/* Footer */}
        {!confirmDelete ? (
          <div className="px-5 pb-5">
            <Button
              variant="outline"
              data-ocid="reports.delete_button"
              onClick={() => setConfirmDelete(true)}
              className="w-full h-11 gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="w-4 h-4" />
              Delete Report
            </Button>
          </div>
        ) : (
          <div
            data-ocid="reports.confirm_delete"
            className="px-5 pb-5 space-y-3"
          >
            <div className="flex gap-2 bg-destructive/5 border border-destructive/20 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive leading-relaxed">
                This will permanently delete the report and its file. This
                cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                data-ocid="reports.delete_cancel_button"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                data-ocid="reports.delete_confirm_button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 h-11"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Reports List Page ────────────────────────────────────────

export function ReportsPage() {
  const { data: reports, isLoading } = useReports();
  const deleteReport = useDeleteReport();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const handleDelete = (id: bigint) => {
    deleteReport.mutate(id, {
      onSuccess: () => {
        toast.success("Report deleted");
        setSelectedReport(null);
      },
      onError: () => toast.error("Failed to delete report"),
    });
  };

  const header = (
    <div className="flex items-center justify-between">
      <h1 className="text-lg font-display font-bold text-foreground">
        My Reports
      </h1>
      <Button
        data-ocid="reports.add_button"
        size="sm"
        className="h-10 gap-1.5 px-4"
        onClick={() => setUploadOpen(true)}
      >
        <Plus className="w-4 h-4" />
        Upload
      </Button>
    </div>
  );

  return (
    <Layout header={header}>
      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-3" data-ocid="reports.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[88px] rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !reports?.length && (
        <motion.div
          data-ocid="reports.empty_state"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center py-16 text-center px-4"
        >
          <div className="w-20 h-20 rounded-3xl bg-primary/8 flex items-center justify-center mb-5">
            <FileText className="w-9 h-9 text-primary/60" />
          </div>
          <p className="text-lg font-display font-bold text-foreground mb-2">
            No reports yet
          </p>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-8">
            Upload your lab results, imaging scans, and documents to keep
            everything in one secure place.
          </p>
          <Button
            data-ocid="reports.empty_upload_button"
            className="h-12 px-8"
            onClick={() => setUploadOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload First Report
          </Button>
        </motion.div>
      )}

      {/* Reports list */}
      {!isLoading && reports && reports.length > 0 && (
        <div className="space-y-3 pb-2" data-ocid="reports.list">
          {reports.map((report, i) => {
            const config = REPORT_TYPE_CONFIG[report.reportType];
            const Icon = config.Icon;
            return (
              <motion.button
                key={report.id.toString()}
                data-ocid={`reports.item.${i + 1}`}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                onClick={() => setSelectedReport(report)}
                className="w-full text-left bg-card border border-border rounded-xl p-4 shadow-subtle tap-highlight-none transition-smooth hover:border-primary/30 hover:shadow-card active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${config.badgeClass}`}
                      >
                        {config.label}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {formatDate(report.reportDate)}
                      </span>
                    </div>

                    {report.notes ? (
                      <p className="text-sm text-foreground font-medium leading-snug line-clamp-1 mt-1">
                        {report.notes}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic leading-snug mt-1">
                        No notes
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-muted-foreground">
                      <Paperclip className="w-3 h-3 shrink-0" />
                      <span className="truncate">File attached</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <UploadReportDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />

      {/* Detail Dialog */}
      <ReportDetailDialog
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onDelete={handleDelete}
        isDeleting={deleteReport.isPending}
      />
    </Layout>
  );
}
