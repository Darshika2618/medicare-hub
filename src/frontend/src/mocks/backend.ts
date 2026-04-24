import type { backendInterface, Prescription, Report, Reminder, FollowUp, DashboardSummary, TimelineEvent, DoseRecord, PrescriptionInput, ReportInput, ReminderInput, FollowUpInput, ReminderUpdate } from "../backend";
import { PrescriptionStatus, Variant_lab_other_imaging, Variant_scheduled_rescheduled_completed } from "../backend";

const now = BigInt(Date.now()) * BigInt(1_000_000);
const dayMs = BigInt(86_400_000) * BigInt(1_000_000);

const sampleReminders: Reminder[] = [
  {
    id: BigInt(1),
    dosage: "40mg",
    owner: { toString: () => "user1" } as any,
    createdAt: now - dayMs * BigInt(30),
    reminderTimes: [8n * 3_600_000_000_000n, 20n * 3_600_000_000_000n],
    isActive: true,
    medicineName: "Atorvastatin",
  },
  {
    id: BigInt(2),
    dosage: "1000mg",
    owner: { toString: () => "user1" } as any,
    createdAt: now - dayMs * BigInt(20),
    reminderTimes: [9n * 3_600_000_000_000n],
    isActive: true,
    medicineName: "Metformin",
  },
  {
    id: BigInt(3),
    dosage: "10mg",
    owner: { toString: () => "user1" } as any,
    createdAt: now - dayMs * BigInt(10),
    reminderTimes: [20n * 3_600_000_000_000n],
    isActive: true,
    medicineName: "Lisinopril",
  },
];

const samplePrescriptions: Prescription[] = [
  {
    id: BigInt(1),
    status: PrescriptionStatus.active,
    dosage: "40mg",
    owner: { toString: () => "user1" } as any,
    createdAt: now - dayMs * BigInt(30),
    notes: "Take 1 pill with food",
    frequency: "Once daily",
    startDate: now - dayMs * BigInt(30),
    medicineName: "Atorvastatin",
  },
  {
    id: BigInt(2),
    status: PrescriptionStatus.active,
    dosage: "1000mg",
    owner: { toString: () => "user1" } as any,
    createdAt: now - dayMs * BigInt(20),
    notes: "Take 1 tablet with meals",
    frequency: "Twice daily",
    startDate: now - dayMs * BigInt(20),
    medicineName: "Metformin",
  },
  {
    id: BigInt(3),
    status: PrescriptionStatus.active,
    dosage: "10mg",
    owner: { toString: () => "user1" } as any,
    createdAt: now - dayMs * BigInt(10),
    notes: "Take 1 tablet at bedtime",
    frequency: "Once daily",
    startDate: now - dayMs * BigInt(10),
    medicineName: "Lisinopril",
  },
];

const sampleReports: Report[] = [
  {
    id: BigInt(1),
    owner: { toString: () => "user1" } as any,
    createdAt: now - dayMs * BigInt(5),
    reportDate: now - dayMs * BigInt(5),
    reportType: Variant_lab_other_imaging.lab,
    notes: "Complete blood count - all values normal",
    fileRef: { getDirectURL: () => "", getBytes: async () => new Uint8Array(), withUploadProgress: () => ({} as any) } as any,
  },
  {
    id: BigInt(2),
    owner: { toString: () => "user1" } as any,
    createdAt: now - dayMs * BigInt(15),
    reportDate: now - dayMs * BigInt(15),
    reportType: Variant_lab_other_imaging.imaging,
    notes: "Chest X-ray - normal findings",
    fileRef: { getDirectURL: () => "", getBytes: async () => new Uint8Array(), withUploadProgress: () => ({} as any) } as any,
  },
];

const sampleFollowUps: FollowUp[] = [
  {
    id: BigInt(1),
    status: Variant_scheduled_rescheduled_completed.scheduled,
    scheduledDate: now + dayMs * BigInt(7),
    owner: { toString: () => "user1" } as any,
    createdAt: now - dayMs * BigInt(3),
    notes: "Regular checkup and blood pressure review",
    doctorName: "Dr. Evans",
    department: "Cardiology",
  },
  {
    id: BigInt(2),
    status: Variant_scheduled_rescheduled_completed.scheduled,
    scheduledDate: now + dayMs * BigInt(14),
    owner: { toString: () => "user1" } as any,
    createdAt: now - dayMs * BigInt(2),
    notes: "Diabetes management review",
    doctorName: "Dr. Smith",
    department: "Endocrinology",
  },
];

const sampleTimeline: TimelineEvent[] = [
  {
    id: BigInt(1),
    date: now - dayMs,
    kind: {
      __kind__: "prescription",
      prescription: {
        status: PrescriptionStatus.active,
        dosage: "40mg",
        frequency: "Once daily",
        medicineName: "Atorvastatin",
      },
    },
  },
  {
    id: BigInt(2),
    date: now - dayMs,
    kind: {
      __kind__: "followup",
      followup: {
        status: Variant_scheduled_rescheduled_completed.completed,
        doctorName: "Dr. Evans",
        department: "General Checkup",
      },
    },
  },
  {
    id: BigInt(3),
    date: now - dayMs * BigInt(2),
    kind: {
      __kind__: "report",
      report: {
        reportType: Variant_lab_other_imaging.lab,
        notes: "Migraine logged",
        fileRef: { getDirectURL: () => "", getBytes: async () => new Uint8Array(), withUploadProgress: () => ({} as any) } as any,
      },
    },
  },
  {
    id: BigInt(4),
    date: now - dayMs * BigInt(3),
    kind: {
      __kind__: "prescription",
      prescription: {
        status: PrescriptionStatus.active,
        dosage: "1000mg",
        frequency: "Twice daily",
        medicineName: "Metformin",
      },
    },
  },
];

const dashboard: DashboardSummary = {
  todayReminders: sampleReminders,
  recentReports: sampleReports,
  activePrescriptions: samplePrescriptions,
  upcomingFollowUps: sampleFollowUps,
};

export const mockBackend: backendInterface = {
  addPrescription: async (_input: PrescriptionInput): Promise<Prescription> => samplePrescriptions[0],
  addReport: async (_input: ReportInput): Promise<Report> => sampleReports[0],
  createReminder: async (_input: ReminderInput): Promise<Reminder> => sampleReminders[0],
  deleteFollowUp: async (_id: bigint): Promise<boolean> => true,
  deleteReminder: async (_id: bigint): Promise<boolean> => true,
  deleteReport: async (_id: bigint): Promise<boolean> => true,
  getDashboardSummary: async (): Promise<DashboardSummary> => dashboard,
  getDoseHistory7Days: async (_sinceTimestamp: bigint): Promise<DoseRecord[]> => [],
  getHealthTimeline: async (): Promise<TimelineEvent[]> => sampleTimeline,
  getPrescription: async (_id: bigint): Promise<Prescription | null> => samplePrescriptions[0],
  getReport: async (_id: bigint): Promise<Report | null> => sampleReports[0],
  getUpcomingFollowUps: async (_nowTimestamp: bigint): Promise<FollowUp[]> => sampleFollowUps,
  listActiveReminders: async (): Promise<Reminder[]> => sampleReminders,
  listFollowUps: async (): Promise<FollowUp[]> => sampleFollowUps,
  listPrescriptions: async (): Promise<Prescription[]> => samplePrescriptions,
  listReports: async (): Promise<Report[]> => sampleReports,
  markFollowUpCompleted: async (_id: bigint): Promise<boolean> => true,
  recordDoseTaken: async (_reminderId: bigint, _date: bigint, _hour: bigint): Promise<DoseRecord> => ({
    id: BigInt(1),
    reminderId: _reminderId,
    owner: { toString: () => "user1" } as any,
    date: _date,
    hour: _hour,
    takenAt: BigInt(Date.now()) * BigInt(1_000_000),
  }),
  rescheduleFollowUp: async (_id: bigint, _newDate: bigint): Promise<boolean> => true,
  scheduleFollowUp: async (_input: FollowUpInput): Promise<FollowUp> => sampleFollowUps[0],
  updatePrescriptionStatus: async (_id: bigint, _status: PrescriptionStatus): Promise<boolean> => true,
  updateReminder: async (_id: bigint, _updates: ReminderUpdate): Promise<boolean> => true,
  _immutableObjectStorageBlobsAreLive: async (_hashes: Array<Uint8Array>): Promise<Array<boolean>> => [],
  _immutableObjectStorageBlobsToDelete: async (): Promise<Array<Uint8Array>> => [],
  _immutableObjectStorageConfirmBlobDeletion: async (_blobs: Array<Uint8Array>): Promise<void> => {},
  _immutableObjectStorageCreateCertificate: async (_blobHash: string) => ({ ok: null } as never),
  _immutableObjectStorageRefillCashier: async (_refillInformation: never) => ({ ok: null } as never),
  _immutableObjectStorageUpdateGatewayPrincipals: async (): Promise<void> => {},
};
