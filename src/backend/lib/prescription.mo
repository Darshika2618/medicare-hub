import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Types "../types/prescription";
import Common "../types/common";

module {
  public func add(
    prescriptions : List.List<Types.Prescription>,
    nextId : Nat,
    caller : Common.UserId,
    input : Types.PrescriptionInput,
  ) : Types.Prescription {
    let now = Int.abs(Time.now()) / 1_000_000_000;
    let prescription : Types.Prescription = {
      id = nextId;
      owner = caller;
      medicineName = input.medicineName;
      dosage = input.dosage;
      frequency = input.frequency;
      startDate = input.startDate;
      endDate = input.endDate;
      notes = input.notes;
      documentRef = input.documentRef;
      status = #active;
      createdAt = now;
    };
    prescriptions.add(prescription);
    prescription;
  };

  public func listForUser(
    prescriptions : List.List<Types.Prescription>,
    caller : Common.UserId,
  ) : [Types.Prescription] {
    prescriptions.filter(func(p) { Principal.equal(p.owner, caller) }).toArray();
  };

  public func getById(
    prescriptions : List.List<Types.Prescription>,
    caller : Common.UserId,
    id : Common.RecordId,
  ) : ?Types.Prescription {
    prescriptions.find(func(p) { p.id == id and Principal.equal(p.owner, caller) });
  };

  public func updateStatus(
    prescriptions : List.List<Types.Prescription>,
    caller : Common.UserId,
    id : Common.RecordId,
    status : Types.PrescriptionStatus,
  ) : Bool {
    var found = false;
    prescriptions.mapInPlace(func(p) {
      if (p.id == id and Principal.equal(p.owner, caller)) {
        found := true;
        { p with status = status };
      } else {
        p;
      }
    });
    found;
  };
};
