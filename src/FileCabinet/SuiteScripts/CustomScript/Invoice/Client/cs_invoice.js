/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(["../Library/lib_invoice.js"], (lib) => {
  const pageInit = (scriptContext) => {
    const currRec = scriptContext.currentRecord;

    lib.initialMessage({
      currRec: currRec,
    });
  };

  const fieldChanged = (scriptContext) => {
    const currRec = scriptContext.currentRecord;
    const fldId = scriptContext.fieldId;

    lib.updateCurrentPercentage({
      currRec: currRec,
      fldId: fldId,
    });
  };

  const saveRecord = (scriptContext) => {
    const currRec = scriptContext.currentRecord;

    const isTrue = lib.checkLineAmount({
      currRec: currRec,
    });

    return isTrue;
  };

  return { pageInit, fieldChanged, saveRecord };
});
