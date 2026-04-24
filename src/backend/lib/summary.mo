import List "mo:core/List";
import Principal "mo:core/Principal";
import PrescriptionTypes "../types/prescription";
import ReportTypes "../types/report";
import FollowUpTypes "../types/followup";
import ReminderTypes "../types/reminder";
import SummaryTypes "../types/summary";
import Common "../types/common";

module {
  public type DashboardSummary = {
    activePrescriptions : [PrescriptionTypes.Prescription];
    todayReminders : [ReminderTypes.Reminder];
    upcomingFollowUps : [FollowUpTypes.FollowUp]; // next 7 days
    recentReports : [ReportTypes.Report]; // last 3
  };

  public func getTimeline(
    prescriptions : List.List<PrescriptionTypes.Prescription>,
    reports : List.List<ReportTypes.Report>,
    followups : List.List<FollowUpTypes.FollowUp>,
    caller : Common.UserId,
  ) : [SummaryTypes.TimelineEvent] {
    var nextId : Nat = 0;

    // Collect prescription events
    let prescriptionEvents = prescriptions
      .filter(func(p) { Principal.equal(p.owner, caller) })
      .map<PrescriptionTypes.Prescription, SummaryTypes.TimelineEvent>(func(p) {
        let ev : SummaryTypes.TimelineEvent = {
          id = nextId;
          date = p.createdAt;
          kind = #prescription {
            medicineName = p.medicineName;
            dosage = p.dosage;
            frequency = p.frequency;
            status = p.status;
          };
        };
        nextId += 1;
        ev;
      })
      .toArray();

    // Collect report events
    let reportEvents = reports
      .filter(func(r) { Principal.equal(r.owner, caller) })
      .map<ReportTypes.Report, SummaryTypes.TimelineEvent>(func(r) {
        let ev : SummaryTypes.TimelineEvent = {
          id = nextId;
          date = r.reportDate;
          kind = #report {
            reportType = r.reportType;
            notes = r.notes;
            fileRef = r.fileRef;
          };
        };
        nextId += 1;
        ev;
      })
      .toArray();

    // Collect follow-up events
    let followupEvents = followups
      .filter(func(f) { Principal.equal(f.owner, caller) })
      .map<FollowUpTypes.FollowUp, SummaryTypes.TimelineEvent>(func(f) {
        let ev : SummaryTypes.TimelineEvent = {
          id = nextId;
          date = f.scheduledDate;
          kind = #followup {
            doctorName = f.doctorName;
            department = f.department;
            status = f.status;
          };
        };
        nextId += 1;
        ev;
      })
      .toArray();

    // Merge and sort by date descending
    let all = prescriptionEvents
      .concat(reportEvents)
      .concat(followupEvents);

    all.sort(func(a, b) {
      if (a.date > b.date) #less
      else if (a.date < b.date) #greater
      else #equal
    });
  };

  public func getDashboard(
    prescriptions : List.List<PrescriptionTypes.Prescription>,
    reminders : List.List<ReminderTypes.Reminder>,
    followups : List.List<FollowUpTypes.FollowUp>,
    reports : List.List<ReportTypes.Report>,
    caller : Common.UserId,
    nowSeconds : Nat,
  ) : DashboardSummary {
    let sevenDays = 7 * 24 * 3600;
    let sevenDaysEnd = nowSeconds + sevenDays;

    let activePrescriptions = prescriptions
      .filter(func(p) { Principal.equal(p.owner, caller) and p.status == #active })
      .toArray();

    let todayReminders = reminders
      .filter(func(r) { Principal.equal(r.owner, caller) and r.isActive })
      .toArray();

    let upcomingFollowUps = followups
      .filter(func(f) {
        Principal.equal(f.owner, caller) and
        f.status == #scheduled and
        f.scheduledDate >= nowSeconds and
        f.scheduledDate <= sevenDaysEnd
      })
      .toArray();

    // Last 3 reports reverse-chronological
    let allReports = reports
      .filter(func(r) { Principal.equal(r.owner, caller) })
      .reverse()
      .toArray();
    let recentReports = if (allReports.size() <= 3) {
      allReports;
    } else {
      allReports.sliceToArray(0, 3);
    };

    {
      activePrescriptions;
      todayReminders;
      upcomingFollowUps;
      recentReports;
    };
  };
};
