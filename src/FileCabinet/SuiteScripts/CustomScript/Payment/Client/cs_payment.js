/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(["../Library/lib_payment.js"], (lib) => {
  const pageInit = (scriptContext) => {
    lib.pageLoad({
      currRec: scriptContext.currentRecord,
      mode: scriptContext.mode,
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

  return { pageInit, fieldChanged, saveRecord };
});
