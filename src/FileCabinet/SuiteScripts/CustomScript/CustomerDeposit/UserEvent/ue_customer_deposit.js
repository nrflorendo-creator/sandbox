/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
  "N/ui/serverWidget",
  "../Library/lib_customer_deposit.js",
  "../../Library/lib_btn_remove",
], (serverWidget, lib, remove) => {
  const beforeLoad = (scriptContext) => {
    if (scriptContext.type === scriptContext.UserEventType.VIEW) {
      remove.btnRemove({
        newRec: scriptContext.newRecord,
        form: scriptContext.form,
      });
    }

    lib.addField({
      form: scriptContext.form,
      fldType: serverWidget.FieldType,
      type: scriptContext.type,
    });
  };

  return { beforeLoad };
});
