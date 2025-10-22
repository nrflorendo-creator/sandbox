/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(["../Library/lib_invoice.js"], (lib) => {
  const saveRecord = (scriptContext) => {
    const currRec = scriptContext.currentRecord;

    const isTrue = lib.checking({
      currRec: currRec,
    });

    return isTrue;
  };

  return { saveRecord };
});
