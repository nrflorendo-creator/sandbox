/**
 * @NApiVersion 2.1
 */
define(["N/runtime"], (runtime) => {
  const lockRecord = (options) => {
    const currentUser = runtime.getCurrentUser();
    const recType = options.newRec.type;
    log.debug("recType -> lib_disabled_edit", recType);

    const inStatus = options.newRec.getValue({
      fieldId:
        recType == "inventoryitem" || recType == "noninventoryitem"
          ? "custitem_pdi_approval_status"
          : recType == "customerdeposit"
          ? "status"
          : "custbody_pdi_approval_status",
    });

    const isInActive = options.newRec.getValue("isinactive");

    if (inStatus == 2 && !isInActive) return;
    if (currentUser.role == 3) return;
    throw "You are not allowed to edit this record.";
  };

  const bar = () => {};

  return { lockRecord, bar };
});
