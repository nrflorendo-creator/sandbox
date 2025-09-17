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

    let blHasCredit = false;

    const inStatus = newRec.getValue({
      fieldId: "custbody_pdi_approval_status",
    });

    btnRemove.btnEdit({
      form: form,
      inStatus: inStatus,
    });

    // const inAmountRemaining = newRec.getValue({
    //   fieldId: "amountremainingtotalbox",
    // });
    // const inTotal = newRec.getValue({
    //   fieldId: "total",
    // });
    // if (inAmountRemaining < inTotal) {
    //   blHasCredit = true;
    // }

    // const inRelatedRecord = newRec.getValue({
    //   fieldId: "custbody_pdi_related_record",
    // });
    // if (inRelatedRecord || !blHasCredit) {
    //   form.removeButton({
    //     id: "credit",
    //   });
    // }
  };

  /**
   * Defines the function definition that is executed before record is submitted.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */
  const beforeSubmit = (scriptContext) => {};

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
