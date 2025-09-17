/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["N/query", "N/record"], (query, record) => {
  /**
   * Defines the function definition that is executed before record is loaded.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @param {Form} scriptContext.form - Current form
   * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
   * @since 2015.2
   */
  const beforeLoad = (scriptContext) => {};

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
  const afterSubmit = (scriptContext) => {
    const newRec = scriptContext.newRecord;

    if (scriptContext.type === scriptContext.UserEventType.CREATE) {
      let inApplyId = "";
      const inLine = newRec.getLineCount({
        sublistId: "apply",
      });

      for (let indx = 0; indx < inLine; indx++) {
        const inApply = newRec.getSublistValue({
          sublistId: "apply",
          fieldId: "internalid",
          line: indx,
        });
        inApplyId = inApply;
      }

      const objData = query
        .runSuiteQL({
          query: `SELECT
                    cm.id AS creditmemo_id,
                    inv.id AS invoice_id,
                    so.id AS salesorder_id
                    
                    FROM transaction cm
                    
                    LEFT JOIN transactionLine cmLine ON cm.id = cmLine.transaction
                    LEFT JOIN transaction inv ON cmLine.createdfrom = inv.id
                    LEFT JOIN transactionLine invLine ON inv.id = invLine.transaction
                    LEFT JOIN transaction so ON invLine.createdfrom = so.id
                    
                    WHERE cm.id = ${inApplyId} AND cmLine.mainline = 'T' AND invLine.mainline = 'T'`,
        })
        .asMappedResults()[0];
      log.debug("objData", objData);

      record.submitFields({
        type: record.Type.SALES_ORDER,
        id: objData.salesorder_id,
        values: {
          custbody_pdi_approval_status: 8,
        },
      });
    }
  };

  return { beforeLoad, beforeSubmit, afterSubmit };
});
