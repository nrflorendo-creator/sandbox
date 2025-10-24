/**
 * @NApiVersion 2.1
 */
define(["N/record", "N/search", "N/query"], (record, search, query) => {
  const submitFields = (options) => {
    const inCreatedFrom = options.newRec.getValue({
      fieldId: "createdfrom",
    });

    if (inCreatedFrom) {
      record.submitFields({
        type: record.Type.INVOICE,
        id: inCreatedFrom,
        values: {
          custbody_pdi_related_record: options.newRec.id,
        },
      });
    }
  };

  const deletingCustomerRefund = (options) => {
    const inLine = options.newRec.getLineCount({
      sublistId: "apply",
    });
    for (let indx = 0; indx < inLine; indx++) {
      const stType = options.newRec.getSublistValue({
        sublistId: "apply",
        fieldId: "trantype",
        line: indx,
      });

      if (stType == "CustRfnd") {
        const isApply = options.newRec.getSublistValue({
          sublistId: "apply",
          fieldId: "apply",
          line: indx,
        });

        if (!isApply) {
          const recId = options.newRec.getSublistValue({
            sublistId: "apply",
            fieldId: "internalid",
            line: indx,
          });

          const recDeleted = record.delete({
            type: record.Type.CUSTOMER_REFUND,
            id: recId,
          });

          const inCreatedFrom = options.newRec.getValue({
            fieldId: "createdfrom",
          });

          const fldSearch = search.lookupFields({
            type: search.Type.INVOICE,
            id: inCreatedFrom,
            columns: ["createdfrom"],
          });

          record.submitFields({
            type: record.Type.SALES_ORDER,
            id: fldSearch.createdfrom[0].value,
            values: {
              custbody_pdi_approval_status: 6,
            },
          });

          const objDataPDC = query
            .runSuiteQL({
              query: `SELECT pdc.id FROM CUSTOMRECORD_PDI_POST_DATED_CHECKS pdc WHERE pdc.custrecord_main_record = ${fldSearch.createdfrom[0].value}`,
            })
            .asMappedResults();
          log.debug("objDataPDC", objDataPDC);

          objDataPDC.forEach((row) => {
            record.submitFields({
              type: "customrecord_pdi_post_dated_checks",
              id: row.id,
              values: {
                isinactive: false,
              },
            });
          });
        }
      }
    }
  };

  return { submitFields, deletingCustomerRefund };
});
