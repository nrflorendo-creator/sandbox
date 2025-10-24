/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(["N/record", "../Library/lib_customer_refund.js"], (record, lib) => {
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

  return { pageInit, postSourcing };
});
