import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import SummaryLib "../lib/summary";
import PrescriptionTypes "../types/prescription";
import ReportTypes "../types/report";
import FollowUpTypes "../types/followup";
import ReminderTypes "../types/reminder";
import SummaryTypes "../types/summary";

mixin (
  prescriptions : List.List<PrescriptionTypes.Prescription>,
  reports : List.List<ReportTypes.Report>,
  followups : List.List<FollowUpTypes.FollowUp>,
  reminders : List.List<ReminderTypes.Reminder>,
) {
  public shared query ({ caller }) func getHealthTimeline() : async [SummaryTypes.TimelineEvent] {
    SummaryLib.getTimeline(prescriptions, reports, followups, caller);
  };

  public shared query ({ caller }) func getDashboardSummary() : async SummaryLib.DashboardSummary {
    let nowSeconds = Int.abs(Time.now()) / 1_000_000_000;
    SummaryLib.getDashboard(prescriptions, reminders, followups, reports, caller, nowSeconds);
  };
};
