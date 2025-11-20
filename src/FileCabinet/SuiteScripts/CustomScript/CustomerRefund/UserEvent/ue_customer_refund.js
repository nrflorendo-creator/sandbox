/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
  "N/ui/serverWidget",
  "N/redirect",
  "N/record",
  "../Library/lib_customer_refund.js",
], (serverWidget, redirect, record, lib) => {
  const beforeLoad = (scriptContext) => {
    lib.addField({
      form: scriptContext.form,
      fldType: serverWidget.FieldType,
      type: scriptContext.type,
    });

    if (scriptContext.type === scriptContext.UserEventType.VIEW) {
      lib.showWarningMessage({
        form: scriptContext.form,
        showmsg: scriptContext.request.parameters.showmsg,
      });
    }
  };

  const afterSubmit = (scriptContext) => {
    if (scriptContext.type === scriptContext.UserEventType.CREATE) {
      lib.toProcessCancelSO({
        newRec: scriptContext.newRecord,
      });

      // Set Show Message Parameter for the showWarningMessage function in the beforeLoad
      redirect.toRecord({
        type: record.Type.CUSTOMER_REFUND,
        id: scriptContext.newRecord.id,
        parameters: { showmsg: "T" },
      });
    }
  };

  return { beforeLoad, afterSubmit };
});
