import Storage "mo:caffeineai-object-storage/Storage";
import Common "common";

module {
  public type PrescriptionStatus = { #active; #inactive };

  public type Prescription = {
    id : Common.RecordId;
    owner : Common.UserId;
    medicineName : Text;
    dosage : Text;
    frequency : Text; // e.g. "daily", "twice daily", "three times daily"
    startDate : Common.Timestamp;
    endDate : ?Common.Timestamp;
    notes : Text;
    documentRef : ?Storage.ExternalBlob;
    status : PrescriptionStatus;
    createdAt : Common.Timestamp;
  };

  public type PrescriptionInput = {
    medicineName : Text;
    dosage : Text;
    frequency : Text;
    startDate : Common.Timestamp;
    endDate : ?Common.Timestamp;
    notes : Text;
    documentRef : ?Storage.ExternalBlob;
  };
};
