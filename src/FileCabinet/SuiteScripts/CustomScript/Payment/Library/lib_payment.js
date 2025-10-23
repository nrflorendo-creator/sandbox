/**
 * @NApiVersion 2.1
 */
define(["N/record", "N/query"], (record, query) => {
  const updatPDC = (options) => {
    const eventType = options.type;

    const arrData = [];
    const pdcMap = {};
    let inInvoiceId = null;

    const inLine = options.newRec.getLineCount({ sublistId: "apply" });

    for (let indx = 0; indx < inLine; indx++) {
      const isApply = options.newRec.getSublistValue({
        sublistId: "apply",
        fieldId: "apply",
        line: indx,
      });

      if (isApply) {
        if (!inInvoiceId) {
          inInvoiceId = options.newRec.getSublistValue({
            sublistId: "apply",
            fieldId: "doc",
            line: indx,
          });
        }

        arrData.push({
          inInstallment:
            options.newRec.getSublistValue({
              sublistId: "apply",
              fieldId: "installmentnumber",
              line: indx,
            }) || 0,
          inPayment: options.newRec.getSublistValue({
            sublistId: "apply",
            fieldId: "amount",
            line: indx,
          }),
        });
      }
    }

    if (!inInvoiceId) return;

    const recInvoice = record.load({
      type: record.Type.INVOICE,
      id: inInvoiceId,
    });

    const inCreatedFrom = recInvoice.getValue("createdfrom");
    const installmentNumbers = arrData.map((i) => i.inInstallment);
    const inClause = installmentNumbers.join(",");

    const objDataPDC = query
      .runSuiteQL({
        query: `SELECT pdc.id, custrecord_installment_number AS installment_number
                  , pdc.custrecord_amount_due AS amount_due
                  , pdc.custrecord_payment AS payment
                  
                  FROM CUSTOMRECORD_PDI_POST_DATED_CHECKS pdc
                  
                  WHERE pdc.custrecord_main_record = ${inCreatedFrom} AND custrecord_installment_number IN (${inClause})`,
      })
      .asMappedResults();

    objDataPDC.forEach((row) => {
      pdcMap[row.installment_number] = row;
    });

    arrData.forEach((item) => {
      const match = pdcMap[item.inInstallment];
      if (match) {
        const recPDC = record.load({
          type: "customrecord_pdi_post_dated_checks",
          id: match.id,
          isDynamic: true,
        });

        let stStatus = "Clearing";
        let currentPayment = Number(match.payment) || 0;
        let currentAmountDue = Number(match.amount_due) || 0;
        const paymentFromInvoice = Number(item.inPayment) || 0;

        if (eventType === "create") {
          currentPayment += paymentFromInvoice;
          currentAmountDue -= paymentFromInvoice;
          if (currentAmountDue == 0) {
            stStatus = "Cleared/Deposited";
          }
        }

        if (eventType === "delete") {
          currentPayment -= paymentFromInvoice;
          currentAmountDue += paymentFromInvoice;
        }

        recPDC.setValue({
          fieldId: "custrecord_payment",
          value: currentPayment,
        });
        recPDC.setValue({
          fieldId: "custrecord_amount_due",
          value: currentAmountDue,
        });
        recPDC.setValue({
          fieldId: "custrecord_status",
          value: stStatus,
        });

        recPDC.save();
      }
    });
  };

  return { updatPDC };
});
