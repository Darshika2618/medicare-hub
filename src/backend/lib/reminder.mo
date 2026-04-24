import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Types "../types/reminder";
import Common "../types/common";

module {
  public func create(
    reminders : List.List<Types.Reminder>,
    nextId : Nat,
    caller : Common.UserId,
    input : Types.ReminderInput,
  ) : Types.Reminder {
    let now = Int.abs(Time.now()) / 1_000_000_000;
    let reminder : Types.Reminder = {
      id = nextId;
      owner = caller;
      medicineName = input.medicineName;
      dosage = input.dosage;
      reminderTimes = input.reminderTimes;
      isActive = true;
      createdAt = now;
    };
    reminders.add(reminder);
    reminder;
  };

  public func listActive(
    reminders : List.List<Types.Reminder>,
    caller : Common.UserId,
  ) : [Types.Reminder] {
    reminders.filter(func(r) { Principal.equal(r.owner, caller) and r.isActive }).toArray();
  };

  public func update(
    reminders : List.List<Types.Reminder>,
    caller : Common.UserId,
    id : Common.RecordId,
    updates : Types.ReminderUpdate,
  ) : Bool {
    var found = false;
    reminders.mapInPlace(func(r) {
      if (r.id == id and Principal.equal(r.owner, caller)) {
        found := true;
        {
          r with
          medicineName = switch (updates.medicineName) { case (?v) v; case null r.medicineName };
          dosage = switch (updates.dosage) { case (?v) v; case null r.dosage };
          reminderTimes = switch (updates.reminderTimes) { case (?v) v; case null r.reminderTimes };
          isActive = switch (updates.isActive) { case (?v) v; case null r.isActive };
        };
      } else {
        r;
      }
    });
    found;
  };

  public func delete(
    reminders : List.List<Types.Reminder>,
    caller : Common.UserId,
    id : Common.RecordId,
  ) : Bool {
    let sizeBefore = reminders.size();
    let filtered = reminders.filter(func(r) { not (r.id == id and Principal.equal(r.owner, caller)) });
    reminders.clear();
    reminders.append(filtered);
    reminders.size() < sizeBefore;
  };

  public func recordDose(
    doses : List.List<Types.DoseRecord>,
    nextDoseId : Nat,
    caller : Common.UserId,
    reminderId : Common.RecordId,
    date : Common.Timestamp,
    hour : Nat,
  ) : Types.DoseRecord {
    let now = Int.abs(Time.now()) / 1_000_000_000;
    let dose : Types.DoseRecord = {
      id = nextDoseId;
      reminderId = reminderId;
      owner = caller;
      date = date;
      hour = hour;
      takenAt = now;
    };
    doses.add(dose);
    dose;
  };

  public func getDoseHistory(
    doses : List.List<Types.DoseRecord>,
    caller : Common.UserId,
    since : Common.Timestamp,
  ) : [Types.DoseRecord] {
    doses.filter(func(d) { Principal.equal(d.owner, caller) and d.date >= since }).toArray();
  };
};
