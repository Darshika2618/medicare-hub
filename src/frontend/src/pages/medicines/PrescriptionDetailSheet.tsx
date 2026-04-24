import type { ExternalBlob } from "@/backend";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { type Prescription, PrescriptionStatus } from "@/hooks/use-health-data";
import { formatDate } from "@/lib/backend-client";
import {
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Pill,
  X,
} from "lucide-react";

const statusStyles: Record<PrescriptionStatus, string> = {
  [PrescriptionStatus.active]:
    "bg-secondary/10 text-secondary border-secondary/20",
  [PrescriptionStatus.inactive]: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<PrescriptionStatus, string> = {
  [PrescriptionStatus.active]: "Active",
  [PrescriptionStatus.inactive]: "Inactive",
};

function isImageFile(filename: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(filename);
}

interface Props {
  prescription: Prescription | null;
  onClose: () => void;
}

export function PrescriptionDetailSheet({ prescription: rx, onClose }: Props) {
  if (!rx) return null;

  const blob = rx.documentRef as ExternalBlob | undefined;

  const handleDownload = async (filename: string) => {
    if (!blob) return;
    const bytes = await blob.getBytes();
    const file = new Blob([bytes]);
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const docUrl = blob?.getDirectURL();
  // Use a display filename since backend doesn't store filename separately
  const docFilename = "prescription-document";

  return (
    <Sheet open={!!rx} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        data-ocid="medicines.prescription_detail.dialog"
        className="rounded-t-2xl max-h-[90dvh] overflow-y-auto px-4 pb-8"
      >
        <SheetHeader className="mb-5 pt-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <SheetTitle className="text-base font-display font-bold text-foreground leading-tight">
                {rx.medicineName}
              </SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {rx.dosage} · {rx.frequency}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant="outline"
                className={`text-xs ${statusStyles[rx.status]}`}
              >
                {statusLabels[rx.status]}
              </Badge>
              <button
                type="button"
                data-ocid="medicines.prescription_detail.close_button"
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-muted tap-highlight-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-4">
          {/* Medicine icon + details */}
          <div className="flex items-start gap-3 bg-primary/5 border border-primary/15 rounded-xl p-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
                Dosage & Frequency
              </p>
              <p className="text-sm text-foreground font-medium">{rx.dosage}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {rx.frequency}
              </p>
            </div>
          </div>

          {/* Notes */}
          {rx.notes && (
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
                Notes
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {rx.notes}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center gap-3 py-3 border-b border-border">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex gap-6">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  Start date
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(rx.startDate)}
                </p>
              </div>
              {rx.endDate && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    End date
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(rx.endDate)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Uploaded document */}
          {blob && docUrl && (
            <div className="rounded-xl border border-border overflow-hidden">
              {isImageFile(docFilename) ? (
                <div>
                  <img
                    src={docUrl}
                    alt="Prescription document"
                    className="w-full max-h-48 object-cover"
                  />
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-t border-border">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs text-foreground truncate">
                        Prescription document
                      </span>
                    </div>
                    <button
                      type="button"
                      data-ocid="medicines.prescription_detail.download_button"
                      onClick={() => handleDownload(docFilename)}
                      aria-label="Download file"
                      className="flex items-center gap-1 text-xs text-primary font-medium tap-highlight-none shrink-0 pl-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-foreground truncate">
                      Prescription document attached
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-ocid="medicines.prescription_detail.view_document_link"
                      className="flex items-center gap-1 text-xs text-primary font-medium tap-highlight-none"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </a>
                    <button
                      type="button"
                      data-ocid="medicines.prescription_detail.download_button"
                      onClick={() => handleDownload(docFilename)}
                      aria-label="Download"
                      className="flex items-center gap-1 text-xs text-muted-foreground font-medium tap-highlight-none ml-3"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          data-ocid="medicines.prescription_detail.close_button"
          onClick={onClose}
          className="mt-6 w-full h-11 flex items-center justify-center rounded-xl border border-border text-sm text-muted-foreground transition-smooth active:scale-[0.98] tap-highlight-none"
        >
          Close
        </button>
      </SheetContent>
    </Sheet>
  );
}
