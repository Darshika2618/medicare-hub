// Core domain types for MediSafe health management app

export type PrescriptionStatus = "active" | "completed" | "cancelled";
export type ReminderFrequency =
  | "daily"
  | "twice_daily"
  | "weekly"
  | "as_needed";
export type FollowUpStatus = "scheduled" | "completed" | "cancelled";
export type ReportType = "lab" | "imaging" | "prescription" | "other";

export interface Prescription {
  id: string;
  medicineName: string;
  dosage: string;
  form: string; // "Tablet", "Capsule", "Syrup", etc.
  instructions: string;
  prescribedBy: string;
  startDate: bigint; // Unix timestamp in nanoseconds
  endDate: bigint | null;
  status: PrescriptionStatus;
  createdAt: bigint;
}

export interface Reminder {
  id: string;
  prescriptionId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string; // "HH:MM" format
  frequency: ReminderFrequency;
  notes: string;
  isActive: boolean;
  createdAt: bigint;
}

export interface DoseRecord {
  id: string;
  reminderId: string;
  medicineName: string;
  dosage: string;
  takenAt: bigint; // Unix timestamp in nanoseconds
  scheduledTime: string;
  notes: string;
}

export interface Report {
  id: string;
  title: string;
  reportType: ReportType;
  doctorName: string;
  reportDate: bigint; // Unix timestamp in nanoseconds
  description: string;
  fileUrl: string | null;
  createdAt: bigint;
}

export interface FollowUp {
  id: string;
  doctorName: string;
  specialty: string;
  scheduledDate: bigint; // Unix timestamp in nanoseconds
  location: string;
  notes: string;
  status: FollowUpStatus;
  reminderEnabled: boolean;
  createdAt: bigint;
}

export interface DashboardSummary {
  todayReminders: Reminder[];
  upcomingFollowUps: FollowUp[];
  activePrescriptions: number;
  recentDoses: DoseRecord[];
  nextFollowUp: FollowUp | null;
}

// UI display helpers
export interface MedicineScheduleItem {
  reminder: Reminder;
  isTaken: boolean;
  isNext: boolean;
  doseRecord?: DoseRecord;
}
