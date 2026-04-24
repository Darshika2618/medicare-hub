/**
 * React Query hooks for all health data domains.
 * Wires frontend to the real backend actor via useActor + createActor.
 * Backend types are imported from @/backend (generated candid bindings).
 */

import {
  type DoseRecord,
  type ExternalBlob,
  type FollowUp,
  type Prescription,
  PrescriptionStatus,
  type Reminder,
  type Report,
  Variant_lab_other_imaging,
  Variant_scheduled_rescheduled_completed,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Re-export backend types for convenience
export type {
  DoseRecord,
  ExternalBlob,
  FollowUp,
  Prescription,
  Reminder,
  Report,
};
export {
  PrescriptionStatus,
  Variant_lab_other_imaging,
  Variant_scheduled_rescheduled_completed,
};

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────

export function useDashboardSummary() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardSummary();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

// ─────────────────────────────────────────────
// Prescriptions
// ─────────────────────────────────────────────

export function usePrescriptions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Prescription[]>({
    queryKey: ["prescriptions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPrescriptions();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function usePrescription(id: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Prescription | null>({
    queryKey: ["prescriptions", id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPrescription(id);
    },
    enabled: !!actor && !isFetching && id >= 0n,
  });
}

export function useAddPrescription() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    Prescription,
    Error,
    {
      medicineName: string;
      dosage: string;
      frequency: string;
      notes: string;
      startDate: bigint;
      endDate?: bigint;
      documentRef?: ExternalBlob;
    }
  >({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Not connected");
      return actor.addPrescription(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useTogglePrescriptionStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    boolean,
    Error,
    { id: bigint; status: PrescriptionStatus }
  >({
    mutationFn: async ({ id, status }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updatePrescriptionStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ─────────────────────────────────────────────
// Reminders
// ─────────────────────────────────────────────

export function useReminders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Reminder[]>({
    queryKey: ["reminders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActiveReminders();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useAddReminder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    Reminder,
    Error,
    { medicineName: string; dosage: string; reminderTimes: Array<bigint> }
  >({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Not connected");
      return actor.createReminder(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateReminder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    boolean,
    Error,
    {
      id: bigint;
      medicineName?: string;
      dosage?: string;
      reminderTimes?: Array<bigint>;
      isActive?: boolean;
    }
  >({
    mutationFn: async ({ id, ...updates }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateReminder(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}

export function useDeleteReminder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteReminder(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}

// ─────────────────────────────────────────────
// Dose History
// ─────────────────────────────────────────────

export function useDoseHistory() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["dose-history"],
    queryFn: async () => {
      if (!actor) return [];
      const since = BigInt(Date.now() - 7 * 86_400_000) * 1_000_000n;
      return actor.getDoseHistory7Days(since);
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useLogDose() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<{ id: bigint }, Error, { reminderId: bigint }>({
    mutationFn: async ({ reminderId }) => {
      if (!actor) throw new Error("Not connected");
      const now = BigInt(Date.now()) * 1_000_000n;
      const hour = BigInt(new Date().getHours());
      return actor.recordDoseTaken(reminderId, now, hour);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dose-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ─────────────────────────────────────────────
// Reports
// ─────────────────────────────────────────────

export function useReports() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Report[]>({
    queryKey: ["reports"],
    queryFn: async () => {
      if (!actor) return [];
      const reports = await actor.listReports();
      return [...reports].sort((a, b) => Number(b.reportDate - a.reportDate));
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useReport(id: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Report | null>({
    queryKey: ["reports", id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getReport(id);
    },
    enabled: !!actor && !isFetching && id >= 0n,
  });
}

export function useAddReport() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    Report,
    Error,
    {
      reportType: Variant_lab_other_imaging;
      reportDate: bigint;
      notes: string;
      fileRef: ExternalBlob;
    }
  >({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Not connected");
      return actor.addReport(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteReport() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteReport(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ─────────────────────────────────────────────
// Follow-ups
// ─────────────────────────────────────────────

export function useFollowUps() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["follow-ups"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFollowUps();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useUpcomingFollowUps() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["follow-ups", "upcoming"],
    queryFn: async () => {
      if (!actor) return [];
      const now = BigInt(Date.now()) * 1_000_000n;
      return actor.getUpcomingFollowUps(now);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useCompleteFollowUp() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Not connected");
      return actor.markFollowUpCompleted(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAddFollowUp() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    FollowUp,
    Error,
    {
      doctorName: string;
      department: string;
      scheduledDate: bigint;
      notes: string;
    }
  >({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Not connected");
      return actor.scheduleFollowUp(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteFollowUp() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteFollowUp(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRescheduleFollowUp() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, { id: bigint; newDate: bigint }>({
    mutationFn: async ({ id, newDate }) => {
      if (!actor) throw new Error("Not connected");
      return actor.rescheduleFollowUp(id, newDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
    },
  });
}

// ─────────────────────────────────────────────
// Health Timeline
// ─────────────────────────────────────────────

export function useHealthTimeline() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["health-timeline"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHealthTimeline();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}
