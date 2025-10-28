/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(["../Library/lib_invoice.js"], (lib) => {
  const pageInit = (scriptContext) => {
    lib.initialMessage({
      currRec: scriptContext.currentRecord,
    });
  };

  const fieldChanged = (scriptContext) => {
    lib.updateCurrentPercentage({
      currRec: scriptContext.currentRecord,
      fldId: scriptContext.fieldId,
    });

    lib.fldChanged({
      currRec: scriptContext.currentRecord,
      fieldId: scriptContext.fieldId,
    });
  };

  const saveRecord = (scriptContext) => {
    const isTrue = lib.checkLineAmount({
      currRec: scriptContext.currentRecord,
    });

    return isTrue;
  };

  return { pageInit, fieldChanged, saveRecord };
});
