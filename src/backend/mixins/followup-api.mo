import List "mo:core/List";
import FollowUpLib "../lib/followup";
import FollowUpTypes "../types/followup";
import Common "../types/common";

mixin (
  followups : List.List<FollowUpTypes.FollowUp>,
  nextFollowUpId : List.List<Nat>,
) {
  public shared ({ caller }) func scheduleFollowUp(input : FollowUpTypes.FollowUpInput) : async FollowUpTypes.FollowUp {
    let currentId = nextFollowUpId.at(0);
    let f = FollowUpLib.schedule(followups, currentId, caller, input);
    nextFollowUpId.put(0, currentId + 1);
    f;
  };

  public shared query ({ caller }) func listFollowUps() : async [FollowUpTypes.FollowUp] {
    FollowUpLib.listForUser(followups, caller);
  };

  public shared query ({ caller }) func getUpcomingFollowUps(nowTimestamp : Common.Timestamp) : async [FollowUpTypes.FollowUp] {
    // 30 days window
    FollowUpLib.getUpcoming(followups, caller, nowTimestamp, 30 * 24 * 3600);
  };

  public shared ({ caller }) func markFollowUpCompleted(id : Common.RecordId) : async Bool {
    FollowUpLib.markCompleted(followups, caller, id);
  };

  public shared ({ caller }) func rescheduleFollowUp(id : Common.RecordId, newDate : Common.Timestamp) : async Bool {
    FollowUpLib.reschedule(followups, caller, id, newDate);
  };

  public shared ({ caller }) func deleteFollowUp(id : Common.RecordId) : async Bool {
    FollowUpLib.delete(followups, caller, id);
  };
};
