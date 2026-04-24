import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Types "../types/followup";
import Common "../types/common";

module {
  public func schedule(
    followups : List.List<Types.FollowUp>,
    nextId : Nat,
    caller : Common.UserId,
    input : Types.FollowUpInput,
  ) : Types.FollowUp {
    let now = Int.abs(Time.now()) / 1_000_000_000;
    let followup : Types.FollowUp = {
      id = nextId;
      owner = caller;
      doctorName = input.doctorName;
      department = input.department;
      scheduledDate = input.scheduledDate;
      notes = input.notes;
      status = #scheduled;
      rescheduledDate = null;
      createdAt = now;
    };
    followups.add(followup);
    followup;
  };

  public func listForUser(
    followups : List.List<Types.FollowUp>,
    caller : Common.UserId,
  ) : [Types.FollowUp] {
    followups.filter(func(f) { Principal.equal(f.owner, caller) }).toArray();
  };

  public func getUpcoming(
    followups : List.List<Types.FollowUp>,
    caller : Common.UserId,
    now : Common.Timestamp,
    windowSeconds : Nat,
  ) : [Types.FollowUp] {
    let deadline = now + windowSeconds;
    followups
      .filter(func(f) {
        Principal.equal(f.owner, caller) and
        f.status == #scheduled and
        f.scheduledDate >= now and
        f.scheduledDate <= deadline
      })
      .toArray();
  };

  public func markCompleted(
    followups : List.List<Types.FollowUp>,
    caller : Common.UserId,
    id : Common.RecordId,
  ) : Bool {
    var found = false;
    followups.mapInPlace(func(f) {
      if (f.id == id and Principal.equal(f.owner, caller)) {
        found := true;
        { f with status = #completed };
      } else {
        f;
      }
    });
    found;
  };

  public func reschedule(
    followups : List.List<Types.FollowUp>,
    caller : Common.UserId,
    id : Common.RecordId,
    newDate : Common.Timestamp,
  ) : Bool {
    var found = false;
    followups.mapInPlace(func(f) {
      if (f.id == id and Principal.equal(f.owner, caller)) {
        found := true;
        { f with status = #rescheduled; rescheduledDate = ?newDate };
      } else {
        f;
      }
    });
    found;
  };

  public func delete(
    followups : List.List<Types.FollowUp>,
    caller : Common.UserId,
    id : Common.RecordId,
  ) : Bool {
    let sizeBefore = followups.size();
    let filtered = followups.filter(func(f) { not (f.id == id and Principal.equal(f.owner, caller)) });
    followups.clear();
    followups.append(filtered);
    followups.size() < sizeBefore;
  };
};
