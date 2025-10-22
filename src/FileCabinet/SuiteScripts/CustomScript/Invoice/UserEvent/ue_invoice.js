/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["../Library/lib_invoice.js", "../../Library/lib_btn_remove.js"], (
  lib,
  remove
) => {
  /**
   * Defines the function definition that is executed before record is loaded.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @param {Form} scriptContext.form - Current form
   * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
   * @since 2015.2
   */
  const beforeLoad = (scriptContext) => {
    const newRec = scriptContext.newRecord;
    const form = scriptContext.form;

    if (scriptContext.type === scriptContext.UserEventType.VIEW) {
      remove.btnRemove({
        newRec: newRec,
        form: form,
      });
    }
  };

  /**
   * Defines the function definition that is executed before record is submitted.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */
  const beforeSubmit = (scriptContext) => {
    const newRec = scriptContext.newRecord;

    if (scriptContext.type === scriptContext.UserEventType.DELETE) {
      lib.deleteUpdate({
        newRec: newRec,
      });
    }
  };

  /**
   * Defines the function definition that is executed after record is submitted.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */
  const afterSubmit = (scriptContext) => {
    const newRec = scriptContext.newRecord;

    if (scriptContext.type === scriptContext.UserEventType.CREATE) {
      lib.updatePDC({
        newRec: newRec,
      });
    }

    if (scriptContext.type === scriptContext.UserEventType.EDIT) {
      lib.approve({
        newRec: newRec,
      });
    }
  };

  return { beforeLoad, beforeSubmit, afterSubmit };
});
