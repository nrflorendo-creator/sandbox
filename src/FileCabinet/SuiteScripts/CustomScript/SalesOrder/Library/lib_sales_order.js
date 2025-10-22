/**
 * @NApiVersion 2.1
 */
define(["N/search", "N/record", "N/query"], (search, record, query) => {
  const createPDC = (options) => {
    const inSalesOrderId = options.newRec.id;
    const inTotal = options.newRec.getValue({ fieldId: "total" });
    const objData = getInstallment(inSalesOrderId);

    const recordsToCreate =
      objData.length > 0
        ? objData
        : [{ stAmount: inTotal, stInstallmentNumber: 0 }];

    recordsToCreate.forEach((data) => {
      const recPDC = record.create({
        type: "customrecord_pdi_post_dated_checks",
        isDynamic: true,
      });

      recPDC.setValue({ fieldId: "name", value: "Pending user entry" });
      recPDC.setValue({
        fieldId: "custrecord_related_record",
        value: inSalesOrderId,
      });
      recPDC.setValue({ fieldId: "custrecord_status", value: "Received" });
      recPDC.setValue({
        fieldId: "custrecord_amount",
        value: data.stAmount,
      });
      recPDC.setValue({
        fieldId: "custrecord_amount_due",
        value: data.stAmount,
      });
      recPDC.setValue({
        fieldId: "custrecord_installment_number",
        value: data.stInstallmentNumber,
      });

      const recId = recPDC.save();
    });
  };

  function getInstallment(inSalesOrderId) {
    const arrData = [];

    const objSearch = search.create({
      type: "salesorder",
      filters: [["internalid", "anyof", inSalesOrderId]],
      columns: [
        search.createColumn({ name: "tranid" }),
        search.createColumn({
          name: "installmentnumber",
          join: "installmentOnSalesOrder",
        }),
        search.createColumn({
          name: "amount",
          join: "installmentOnSalesOrder",
        }),
      ],
    });

    objSearch.run().each((result) => {
      arrData.push({
        stDocumentNumber: result.getValue("tranid"),
        stInstallmentNumber: result.getValue({
          name: "installmentnumber",
          join: "installmentOnSalesOrder",
        }),
        stAmount: result.getValue({
          name: "amount",
          join: "installmentOnSalesOrder",
        }),
      });
      return true;
    });

    return arrData;
  }

  function deletePDC(options) {
    const inSalesOrderId = options.newRec.id;

    const objData = query
      .runSuiteQL({
        query: `SELECT pdc.id FROM CUSTOMRECORD_PDI_POST_DATED_CHECKS pdc WHERE pdc.custrecord_related_record = ${inSalesOrderId}`,
      })
      .asMappedResults();
    log.debug("objData", objData);

    if (objData.length > 0) {
      for (let indx = 0; indx < objData.length; indx++) {
        record.delete({
          type: "customrecord_pdi_post_dated_checks",
          id: objData[indx].id,
        });
      }
    }
  }

  return { createPDC, deletePDC };
});
