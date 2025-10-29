/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["../Library/lib_payment.js"], (lib) => {
  const afterSubmit = (scriptContext) => {
    lib.updatPDC({
      newRec: scriptContext.newRecord,
      type: scriptContext.type,
    });
  };

  return { afterSubmit };
});
