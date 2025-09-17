/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["N/query", "../../Library/lib_btn_remove.js"], (query, btnRemove) => {
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
      fieldId: "custbody_pdi_approval_status",
    });

    btnRemove.btnEdit({
      form: form,
      inStatus: inStatus,
    });

    const objData = query
      .runSuiteQL({
        query: `SELECT BUILTIN.DF(relatedRecord.status) AS stStatus
                FROM transaction
                
                LEFT JOIN NextTransactionLink
                    ON transaction.id = NextTransactionLink.previousdoc
                LEFT JOIN transaction relatedRecord
                    ON NextTransactionLink.nextdoc = relatedRecord.id
                
                WHERE transaction.id = ${newRec.id} AND NextTransactionLink.linkType = 'OrdBill'`,
      })
      .asMappedResults()[0];
    log.debug("objData", objData);
    if (objData) {
      if (objData.ststatus != "Invoice : Paid In Full") {
        form.removeButton({
          id: "process",
        });
      }
    } else if (!objData) {
      form.removeButton({
        id: "process",
      });
    }

    if (inStatus != 9) {
      form.removeButton({
        id: "closeremaining",
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
