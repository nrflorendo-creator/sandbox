/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(["../Library/lib_sales_order.js"], (lib) => {
  const saveRecord = (scriptContext) => {
    lib.itemIsInactive({
      currRec: scriptContext.currentRecord,
    });
  };

  return { saveRecord };
});
