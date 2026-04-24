import Common "common";

module {
  public type Reminder = {
    id : Common.RecordId;
    owner : Common.UserId;
    medicineName : Text;
    dosage : Text;
    reminderTimes : [Nat]; // hours in 24h format, e.g. [8, 12, 18]
    isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type ReminderInput = {
    medicineName : Text;
    dosage : Text;
    reminderTimes : [Nat];
  };

  public type ReminderUpdate = {
    medicineName : ?Text;
    dosage : ?Text;
    reminderTimes : ?[Nat];
    isActive : ?Bool;
  };

  public type DoseRecord = {
    id : Common.RecordId;
    reminderId : Common.RecordId;
    owner : Common.UserId;
    date : Common.Timestamp; // date as Unix timestamp (day granularity)
    hour : Nat; // hour taken (0-23)
    takenAt : Common.Timestamp;
  };
};
