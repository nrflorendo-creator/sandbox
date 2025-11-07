/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["N/ui/serverWidget", "../Library/lib_customer_refund.js"], (
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
    if (scriptContext.type === scriptContext.UserEventType.CREATE) {
      lib.toProcessCancelSO({
        newRec: scriptContext.newRecord,
      });
    }
  };

  return { beforeLoad, afterSubmit };
});
