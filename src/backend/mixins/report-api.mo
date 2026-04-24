import List "mo:core/List";
import ReportLib "../lib/report";
import ReportTypes "../types/report";
import Common "../types/common";

mixin (
  reports : List.List<ReportTypes.Report>,
  nextReportId : List.List<Nat>,
) {
  public shared ({ caller }) func addReport(input : ReportTypes.ReportInput) : async ReportTypes.Report {
    let currentId = nextReportId.at(0);
    let r = ReportLib.add(reports, currentId, caller, input);
    nextReportId.put(0, currentId + 1);
    r;
  };

  public shared query ({ caller }) func listReports() : async [ReportTypes.Report] {
    ReportLib.listForUser(reports, caller);
  };

  public shared query ({ caller }) func getReport(id : Common.RecordId) : async ?ReportTypes.Report {
    ReportLib.getById(reports, caller, id);
  };

  public shared ({ caller }) func deleteReport(id : Common.RecordId) : async Bool {
    ReportLib.delete(reports, caller, id);
  };
};
