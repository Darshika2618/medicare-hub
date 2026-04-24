import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Timestamp = bigint;
export interface ReportInput {
    reportDate: Timestamp;
    reportType: ReportType;
    notes: string;
    fileRef: ExternalBlob;
}
export interface PrescriptionInput {
    endDate?: Timestamp;
    documentRef?: ExternalBlob;
    dosage: string;
    notes: string;
    frequency: string;
    startDate: Timestamp;
    medicineName: string;
}
export interface FollowUpInput {
    scheduledDate: Timestamp;
    notes: string;
    doctorName: string;
    department: string;
}
export type TimelineEventKind = {
    __kind__: "report";
    report: {
        reportType: Variant_lab_other_imaging;
        notes: string;
        fileRef: ExternalBlob;
    };
} | {
    __kind__: "prescription";
    prescription: {
        status: PrescriptionStatus;
        dosage: string;
        frequency: string;
        medicineName: string;
    };
} | {
    __kind__: "followup";
    followup: {
        status: Variant_scheduled_rescheduled_completed;
        doctorName: string;
        department: string;
    };
};
export interface ReminderInput {
    dosage: string;
    reminderTimes: Array<bigint>;
    medicineName: string;
}
export interface Report {
    id: RecordId;
    owner: UserId;
    createdAt: Timestamp;
    reportDate: Timestamp;
    reportType: ReportType;
    notes: string;
    fileRef: ExternalBlob;
}
export interface ReminderUpdate {
    dosage?: string;
    reminderTimes?: Array<bigint>;
    isActive?: boolean;
    medicineName?: string;
}
export type RecordId = bigint;
export type UserId = Principal;
export interface TimelineEvent {
    id: RecordId;
    date: Timestamp;
    kind: TimelineEventKind;
}
export interface DoseRecord {
    id: RecordId;
    reminderId: RecordId;
    owner: UserId;
    date: Timestamp;
    hour: bigint;
    takenAt: Timestamp;
}
export interface Reminder {
    id: RecordId;
    dosage: string;
    owner: UserId;
    createdAt: Timestamp;
    reminderTimes: Array<bigint>;
    isActive: boolean;
    medicineName: string;
}
export interface DashboardSummary {
    todayReminders: Array<Reminder>;
    recentReports: Array<Report>;
    activePrescriptions: Array<Prescription>;
    upcomingFollowUps: Array<FollowUp>;
}
export interface FollowUp {
    id: RecordId;
    status: FollowUpStatus;
    scheduledDate: Timestamp;
    owner: UserId;
    createdAt: Timestamp;
    rescheduledDate?: Timestamp;
    notes: string;
    doctorName: string;
    department: string;
}
export interface Prescription {
    id: RecordId;
    status: PrescriptionStatus;
    endDate?: Timestamp;
    documentRef?: ExternalBlob;
    dosage: string;
    owner: UserId;
    createdAt: Timestamp;
    notes: string;
    frequency: string;
    startDate: Timestamp;
    medicineName: string;
}
export enum PrescriptionStatus {
    active = "active",
    inactive = "inactive"
}
export enum Variant_lab_other_imaging {
    lab = "lab",
    other = "other",
    imaging = "imaging"
}
export enum Variant_scheduled_rescheduled_completed {
    scheduled = "scheduled",
    rescheduled = "rescheduled",
    completed = "completed"
}
export interface backendInterface {
    addPrescription(input: PrescriptionInput): Promise<Prescription>;
    addReport(input: ReportInput): Promise<Report>;
    createReminder(input: ReminderInput): Promise<Reminder>;
    deleteFollowUp(id: RecordId): Promise<boolean>;
    deleteReminder(id: RecordId): Promise<boolean>;
    deleteReport(id: RecordId): Promise<boolean>;
    getDashboardSummary(): Promise<DashboardSummary>;
    getDoseHistory7Days(sinceTimestamp: Timestamp): Promise<Array<DoseRecord>>;
    getHealthTimeline(): Promise<Array<TimelineEvent>>;
    getPrescription(id: RecordId): Promise<Prescription | null>;
    getReport(id: RecordId): Promise<Report | null>;
    getUpcomingFollowUps(nowTimestamp: Timestamp): Promise<Array<FollowUp>>;
    listActiveReminders(): Promise<Array<Reminder>>;
    listFollowUps(): Promise<Array<FollowUp>>;
    listPrescriptions(): Promise<Array<Prescription>>;
    listReports(): Promise<Array<Report>>;
    markFollowUpCompleted(id: RecordId): Promise<boolean>;
    recordDoseTaken(reminderId: RecordId, date: Timestamp, hour: bigint): Promise<DoseRecord>;
    rescheduleFollowUp(id: RecordId, newDate: Timestamp): Promise<boolean>;
    scheduleFollowUp(input: FollowUpInput): Promise<FollowUp>;
    updatePrescriptionStatus(id: RecordId, status: PrescriptionStatus): Promise<boolean>;
    updateReminder(id: RecordId, updates: ReminderUpdate): Promise<boolean>;
}
