/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
  "N/record",
  "../../Library/lib_btn_remove.js",
  "../../Library/lib_user_role.js",
], (record, remove, libRole) => {
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

    if (!libRole.user()) {
      if (scriptContext.type === scriptContext.UserEventType.VIEW) {
        form.clientScriptModulePath = "../Client/cs_purchase_order.js";

        if (inStatus == 1) {
          form.addButton({
            id: "custpage_btn_reject",
            label: "Reject",
            functionName: `btnReject(${newRec.id})`,
          });
        }
      }
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
    // const newRec = scriptContext.newRecord;
    // const inSubsidiary = newRec.getValue({
    //   fieldId: "subsidiary",
    // });
    // if (inSubsidiary == 111) {
    //   newRec.setValue({
    //     fieldId: "customform",
    //     value: 173,
    //   });
    // }
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

    if (libRole.user()) {
      if (scriptContext.type === scriptContext.UserEventType.CREATE) {
        const recCurrentPO = record.load({
          type: record.Type.PURCHASE_ORDER,
          id: newRec.id,
          isDyamic: true,
        });

        const inCreatedFrom = recCurrentPO.getSublistValue({
          sublistId: "item",
          fieldId: "linkedorder",
          line: 0,
        });
        log.debug("inCreatedFrom[0]", inCreatedFrom[0]);

        record.submitFields({
          type: record.Type.PURCHASE_REQUISITION,
          id: inCreatedFrom[0],
          values: {
            custbody_pdi_approval_status: 4,
          },
        });
      }
    }
  };

  return { beforeLoad, beforeSubmit, afterSubmit };
});
