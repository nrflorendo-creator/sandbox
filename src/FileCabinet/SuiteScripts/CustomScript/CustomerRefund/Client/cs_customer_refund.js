/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(["../Library/lib_customer_refund.js"], (lib) => {
  const pageInit = (scriptContext) => {
    if (scriptContext.mode === "create") {
      lib.autoPopulateFields({
        currRec: scriptContext.currentRecord,
      });
    }
  };

  const postSourcing = (scriptContext) => {
    lib.disabledFields({
      newRec: scriptContext.currentRecord,
    });
  };

  const fieldChanged = (scriptContext) => {
    lib.fldChanged({
      currRec: scriptContext.currentRecord,
      fieldId: scriptContext.fieldId,
    });
  };

  const saveRecord = (scriptContext) => {
    const isTrue = lib.checkingCheckNumber({
      currRec: scriptContext.currentRecord,
    });

    return isTrue;
  };

  return { pageInit, postSourcing, fieldChanged, saveRecord };
});
