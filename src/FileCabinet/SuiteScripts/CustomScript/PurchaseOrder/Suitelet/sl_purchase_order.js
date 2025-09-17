/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(["N/record"], (record) => {
  /**
   * Defines the Suitelet script trigger point.
   * @param {Object} scriptContext
   * @param {ServerRequest} scriptContext.request - Incoming request
   * @param {ServerResponse} scriptContext.response - Suitelet response
   * @since 2015.2
   */
  const onRequest = (scriptContext) => {
    const params = scriptContext.request.parameters;
    const recId = params.recId;

    try {
      const recPurchaseOrder = record.load({
        type: record.Type.PURCHASE_ORDER,
        id: recId,
      });
      recPurchaseOrder.setValue({
        fieldId: "custbody_pdi_approval_status",
        value: 5,
      });

      const inLine = recPurchaseOrder.getLineCount({ sublistId: "item" });
      for (let indx = 0; indx < inLine; indx++) {
        recPurchaseOrder.setSublistValue({
          sublistId: "item",
          fieldId: "isclosed",
          line: indx,
          value: true,
        });
      }

      recPurchaseOrder.save();

      const inCreatedFrom = recPurchaseOrder.getSublistValue({
        sublistId: "item",
        fieldId: "linkedorder",
        line: 0,
      });

      const recPurchaseRequisition = record.load({
        type: record.Type.PURCHASE_REQUISITION,
        id: inCreatedFrom[0],
      });
      recPurchaseOrder.setValue({
        fieldId: "custbody_pdi_approval_status",
        value: 5,
      });

      const inLinePR = recPurchaseRequisition.getLineCount({
        sublistId: "item",
      });
      for (let indx = 0; indx < inLinePR; indx++) {
        recPurchaseRequisition.setSublistValue({
          sublistId: "item",
          fieldId: "isclosed",
          line: indx,
          value: true,
        });
      }

      recPurchaseRequisition.save();
      // record.submitFields({
      //   type: record.Type.PURCHASE_REQUISITION,
      //   id: inCreatedFrom[0],
      //   values: {
      //     custbody_pdi_approval_status: 5,
      //   },
      // });

      scriptContext.response.setHeader({
        name: "Content-Type",
        value: "application/json",
      });
      scriptContext.response.write(JSON.stringify({ success: true }));
    } catch (e) {
      scriptContext.response.setHeader({
        name: "Content-Type",
        value: "application/json",
      });
      scriptContext.response.write(
        JSON.stringify({ success: false, message: e.message })
      );
    }
  };

  return { onRequest };
});
