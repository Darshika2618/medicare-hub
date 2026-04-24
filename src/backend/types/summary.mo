import Storage "mo:caffeineai-object-storage/Storage";
import Common "common";

module {
  public type TimelineEventKind = {
    #prescription : {
      medicineName : Text;
      dosage : Text;
      frequency : Text;
      status : { #active; #inactive };
    };
    #report : {
      reportType : { #lab; #imaging; #other };
      notes : Text;
      fileRef : Storage.ExternalBlob;
    };
    #followup : {
      doctorName : Text;
      department : Text;
      status : { #scheduled; #completed; #rescheduled };
    };
  };

  public type TimelineEvent = {
    id : Common.RecordId;
    date : Common.Timestamp;
    kind : TimelineEventKind;
  };
};
