import Storage "mo:caffeineai-object-storage/Storage";
import Common "common";

module {
  public type ReportType = { #lab; #imaging; #other };

  public type Report = {
    id : Common.RecordId;
    owner : Common.UserId;
    reportType : ReportType;
    reportDate : Common.Timestamp;
    notes : Text;
    fileRef : Storage.ExternalBlob;
    createdAt : Common.Timestamp;
  };

  public type ReportInput = {
    reportType : ReportType;
    reportDate : Common.Timestamp;
    notes : Text;
    fileRef : Storage.ExternalBlob;
  };
};
