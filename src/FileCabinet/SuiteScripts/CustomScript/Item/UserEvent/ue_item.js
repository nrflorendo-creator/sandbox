/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["../../Library/lib_btn_remove.js"], (btnRemove) => {
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

    const inStatus = newRec.getValue({
      fieldId: "custitem_pdi_approval_status",
    });

    btnRemove.btnEdit({
      form: form,
      inStatus: inStatus,
    });
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

    const inSubsidiary = newRec.getValue({
      fieldId: "subsidiary",
    });
    newRec.setValue({
      fieldId: "custitem_pdi_subsidiary",
      value: inSubsidiary[0],
    });
  };

  /**
   * Defines the function definition that is executed after record is submitted.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */
  const afterSubmit = (scriptContext) => {};

  return { beforeLoad, beforeSubmit, afterSubmit };
});
