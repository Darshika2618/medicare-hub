import List "mo:core/List";
import PrescriptionLib "../lib/prescription";
import PrescriptionTypes "../types/prescription";
import Common "../types/common";

mixin (
  prescriptions : List.List<PrescriptionTypes.Prescription>,
  nextPrescriptionId : List.List<Nat>,
) {
  public shared ({ caller }) func addPrescription(input : PrescriptionTypes.PrescriptionInput) : async PrescriptionTypes.Prescription {
    let currentId = nextPrescriptionId.at(0);
    let p = PrescriptionLib.add(prescriptions, currentId, caller, input);
    nextPrescriptionId.put(0, currentId + 1);
    p;
  };

  public shared query ({ caller }) func listPrescriptions() : async [PrescriptionTypes.Prescription] {
    PrescriptionLib.listForUser(prescriptions, caller);
  };

  public shared query ({ caller }) func getPrescription(id : Common.RecordId) : async ?PrescriptionTypes.Prescription {
    PrescriptionLib.getById(prescriptions, caller, id);
  };

  public shared ({ caller }) func updatePrescriptionStatus(id : Common.RecordId, status : PrescriptionTypes.PrescriptionStatus) : async Bool {
    PrescriptionLib.updateStatus(prescriptions, caller, id, status);
  };
};
