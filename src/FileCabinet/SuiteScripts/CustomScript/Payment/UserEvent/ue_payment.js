/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["N/ui/serverWidget", "../Library/lib_payment.js"], (
  serverWidget,
  lib
) => {
  const beforeLoad = (scriptContext) => {
    lib.addField({
      form: scriptContext.form,
      fldType: serverWidget.FieldType,
      type: scriptContext.type,
    });
  };
  const afterSubmit = (scriptContext) => {
    lib.updatePDC({
      newRec: scriptContext.newRecord,
      type: scriptContext.type,
    });
  };

  return { beforeLoad, afterSubmit };
});
