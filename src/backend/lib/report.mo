import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Types "../types/report";
import Common "../types/common";

module {
  public func add(
    reports : List.List<Types.Report>,
    nextId : Nat,
    caller : Common.UserId,
    input : Types.ReportInput,
  ) : Types.Report {
    let now = Int.abs(Time.now()) / 1_000_000_000;
    let report : Types.Report = {
      id = nextId;
      owner = caller;
      reportType = input.reportType;
      reportDate = input.reportDate;
      notes = input.notes;
      fileRef = input.fileRef;
      createdAt = now;
    };
    reports.add(report);
    report;
  };

  public func listForUser(
    reports : List.List<Types.Report>,
    caller : Common.UserId,
  ) : [Types.Report] {
    // Return in reverse chronological order (newest first)
    reports
      .filter(func(r) { Principal.equal(r.owner, caller) })
      .reverse()
      .toArray();
  };

  public func getById(
    reports : List.List<Types.Report>,
    caller : Common.UserId,
    id : Common.RecordId,
  ) : ?Types.Report {
    reports.find(func(r) { r.id == id and Principal.equal(r.owner, caller) });
  };

  public func delete(
    reports : List.List<Types.Report>,
    caller : Common.UserId,
    id : Common.RecordId,
  ) : Bool {
    let sizeBefore = reports.size();
    let filtered = reports.filter(func(r) { not (r.id == id and Principal.equal(r.owner, caller)) });
    reports.clear();
    reports.append(filtered);
    reports.size() < sizeBefore;
  };
};
