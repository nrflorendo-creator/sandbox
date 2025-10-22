/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(["../Library/lib_customer_deposit.js"], (lib) => {
  const pageInit = (scriptContext) => {
    const currRec = scriptContext.currentRecord;

    lib.load({
      currRec: currRec,
    });
  };

  return { pageInit };
});
