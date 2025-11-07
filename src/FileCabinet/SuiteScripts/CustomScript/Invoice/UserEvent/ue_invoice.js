/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
  "N/ui/serverWidget",
  "../Library/lib_invoice.js",
  "../../Library/lib_btn_remove.js",
  "../../Library/lib_disabled_edit.js",
], (serverWidget, lib, remove, disabledEdit) => {
  const beforeLoad = (scriptContext) => {
    if (scriptContext.type === scriptContext.UserEventType.EDIT) {
      disabledEdit.lockRecord({
        newRec: scriptContext.newRecord,
      });
    }

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

  const beforeSubmit = (scriptContext) => {
    if (scriptContext.type === scriptContext.UserEventType.DELETE) {
      lib.deletePDC({
        newRec: scriptContext.newRecord,
      });
    }
  };

  const afterSubmit = (scriptContext) => {
    if (scriptContext.type === scriptContext.UserEventType.CREATE) {
      lib.createPDC({
        newRec: scriptContext.newRecord,
      });
    }

    if (scriptContext.type === scriptContext.UserEventType.EDIT) {
      lib.updatePDC({
        newRec: scriptContext.newRecord,
      });
    }
  };

  return { beforeLoad, beforeSubmit, afterSubmit };
});
