/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["N/record", "N/search", "../../Library/lib_fld_update.js"], (
  record,
  search,
  update
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

    if (scriptContext.type === scriptContext.UserEventType.EDIT) {
      const inLine = newRec.getLineCount({
        sublistId: "apply",
      });
      log.debug("line count", inLine);
      for (let indx = 0; indx < inLine; indx++) {
        const stType = newRec.getSublistValue({
          sublistId: "apply",
          fieldId: "trantype",
          line: indx,
        });

        log.debug("stType", stType);
        if (stType == "CustRfnd") {
          const isApply = newRec.getSublistValue({
            sublistId: "apply",
            fieldId: "apply",
            line: indx,
          });
          log.debug("isApply", isApply);
          if (!isApply) {
            const recId = newRec.getSublistValue({
              sublistId: "apply",
              fieldId: "internalid",
              line: indx,
            });
            log.debug("recId", recId);
            const recDeleted = record.delete({
              type: record.Type.CUSTOMER_REFUND,
              id: recId,
            });
            log.debug("recDeleted", recDeleted);

            const inCreatedFrom = newRec.getValue({
              fieldId: "createdfrom",
            });

            const fldSearch = search.lookupFields({
              type: search.Type.INVOICE,
              id: inCreatedFrom,
              columns: ["createdfrom"],
            });
            log.debug("fldSearch", fldSearch);

            record.submitFields({
              type: record.Type.SALES_ORDER,
              id: fldSearch.createdfrom[0].value,
              values: {
                custbody_pdi_approval_status: 6,
              },
            });
          }
        }
      }
    }

    if (scriptContext.type === scriptContext.UserEventType.CREATE) {
      update.customRelatedRecord({
        newRec: newRec,
      });
    }
  };

  return { beforeLoad, beforeSubmit, afterSubmit };
});
