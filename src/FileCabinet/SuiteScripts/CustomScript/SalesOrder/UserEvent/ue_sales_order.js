/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
  "../../Library/lib_btn_remove.js",
  "../../Library/lib_pdc_information.js",
], (remove, pdcInformation) => {
  const beforeLoad = (scriptContext) => {
    if (scriptContext.type === scriptContext.UserEventType.VIEW) {
      remove.btnRemove({
        newRec: scriptContext.newRecord,
        form: scriptContext.form,
      });

      pdcInformation.viewList({
        newRec: scriptContext.newRecord,
        form: scriptContext.form,
      });
    }
  };

  return { beforeLoad };
});
