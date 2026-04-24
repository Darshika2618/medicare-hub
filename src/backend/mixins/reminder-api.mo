import List "mo:core/List";
import ReminderLib "../lib/reminder";
import ReminderTypes "../types/reminder";
import Common "../types/common";

mixin (
  reminders : List.List<ReminderTypes.Reminder>,
  nextReminderId : List.List<Nat>,
  doses : List.List<ReminderTypes.DoseRecord>,
  nextDoseId : List.List<Nat>,
) {
  public shared ({ caller }) func createReminder(input : ReminderTypes.ReminderInput) : async ReminderTypes.Reminder {
    let currentId = nextReminderId.at(0);
    let r = ReminderLib.create(reminders, currentId, caller, input);
    nextReminderId.put(0, currentId + 1);
    r;
  };

  public shared query ({ caller }) func listActiveReminders() : async [ReminderTypes.Reminder] {
    ReminderLib.listActive(reminders, caller);
  };

  public shared ({ caller }) func recordDoseTaken(reminderId : Common.RecordId, date : Common.Timestamp, hour : Nat) : async ReminderTypes.DoseRecord {
    let currentId = nextDoseId.at(0);
    let d = ReminderLib.recordDose(doses, currentId, caller, reminderId, date, hour);
    nextDoseId.put(0, currentId + 1);
    d;
  };

  public shared query ({ caller }) func getDoseHistory7Days(sinceTimestamp : Common.Timestamp) : async [ReminderTypes.DoseRecord] {
    ReminderLib.getDoseHistory(doses, caller, sinceTimestamp);
  };

  public shared ({ caller }) func updateReminder(id : Common.RecordId, updates : ReminderTypes.ReminderUpdate) : async Bool {
    ReminderLib.update(reminders, caller, id, updates);
  };

  public shared ({ caller }) func deleteReminder(id : Common.RecordId) : async Bool {
    ReminderLib.delete(reminders, caller, id);
  };
};
