import List "mo:core/List";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import PrescriptionMixin "mixins/prescription-api";
import ReminderMixin "mixins/reminder-api";
import ReportMixin "mixins/report-api";
import FollowUpMixin "mixins/followup-api";
import SummaryMixin "mixins/summary-api";
import PrescriptionTypes "types/prescription";
import ReminderTypes "types/reminder";
import ReportTypes "types/report";
import FollowUpTypes "types/followup";

actor {
  // Object storage infrastructure
  include MixinObjectStorage();

  // Prescription state
  let prescriptions = List.empty<PrescriptionTypes.Prescription>();
  let nextPrescriptionId = List.singleton<Nat>(0);

  // Reminder state
  let reminders = List.empty<ReminderTypes.Reminder>();
  let nextReminderId = List.singleton<Nat>(0);
  let doses = List.empty<ReminderTypes.DoseRecord>();
  let nextDoseId = List.singleton<Nat>(0);

  // Report state
  let reports = List.empty<ReportTypes.Report>();
  let nextReportId = List.singleton<Nat>(0);

  // Follow-up state
  let followups = List.empty<FollowUpTypes.FollowUp>();
  let nextFollowUpId = List.singleton<Nat>(0);

  // Mixin composition
  include PrescriptionMixin(prescriptions, nextPrescriptionId);
  include ReminderMixin(reminders, nextReminderId, doses, nextDoseId);
  include ReportMixin(reports, nextReportId);
  include FollowUpMixin(followups, nextFollowUpId);
  include SummaryMixin(prescriptions, reports, followups, reminders);
};
