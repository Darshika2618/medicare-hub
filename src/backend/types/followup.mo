import Common "common";

module {
  public type FollowUpStatus = { #scheduled; #completed; #rescheduled };

  public type FollowUp = {
    id : Common.RecordId;
    owner : Common.UserId;
    doctorName : Text;
    department : Text;
    scheduledDate : Common.Timestamp;
    notes : Text;
    status : FollowUpStatus;
    rescheduledDate : ?Common.Timestamp;
    createdAt : Common.Timestamp;
  };

  public type FollowUpInput = {
    doctorName : Text;
    department : Text;
    scheduledDate : Common.Timestamp;
    notes : Text;
  };
};
