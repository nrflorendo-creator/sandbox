/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
  "N/ui/serverWidget",
  "../../Library/lib_btn_remove",
  "../Library/lib_customer_deposit.js",
], (serverWidget, remove, lib) => {
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
    });
  };

  return { beforeLoad };
});
