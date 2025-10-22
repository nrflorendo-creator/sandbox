/**
 * @NApiVersion 2.1
 */
define(["N/query", "N/record", "N/ui/dialog", "N/search"], (
  query,
  record,
  dialog,
  search
) => {
  const updatePDC = (options) => {
    const arrData = [];
    const installmentMap = {};

    const inCreatedFrom = options.newRec.getValue({
      fieldId: "createdfrom",
    });

    const inLine = options.newRec.getLineCount({
      sublistId: "installment",
    });

    for (let indx = 0; indx < inLine; indx++) {
      const dtDueDate = options.newRec.getSublistValue({
        sublistId: "installment",
        fieldId: "duedate",
        line: indx,
      });
      const inAmount = options.newRec.getSublistValue({
        sublistId: "installment",
        fieldId: "amount",
        line: indx,
      });

      arrData.push({
        due_date: dtDueDate,
        amount: inAmount,
      });
    }

    const objData = query
      .runSuiteQL({
        query: `SELECT pdc.id, pdc.custrecord_installment_number AS installment_number
                  , pdc.name AS check_number
                  , pdc.custrecord_status AS status
                  , pdc.custrecord_due_date AS due_date
                  , pdc.custrecord_amount AS amount
                  , pdc.custrecord_amount_due AS amount_due
                  , pdc.custrecord_payment AS payment
                  
                  FROM CUSTOMRECORD_PDI_POST_DATED_CHECKS pdc
                  
                  WHERE pdc.custrecord_related_record = ${inCreatedFrom}`,
      })
      .asMappedResults();

    if (!arrData.length) {
      const dtDueDate = options.newRec.getValue({ fieldId: "duedate" });
      const inTotal = options.newRec.getValue({ fieldId: "total" });

      objData.forEach((data) => {
        const recPDC = record.load({
          type: "customrecord_pdi_post_dated_checks",
          id: data.id,
          isDynamic: true,
        });

        recPDC.setValue({ fieldId: "custrecord_status", value: "Clearing" });

        if (dtDueDate) {
          recPDC.setValue({
            fieldId: "custrecord_due_date",
            value: dtDueDate,
          });
        }

        if (inTotal) {
          recPDC.setValue({
            fieldId: "custrecord_amount",
            value: inTotal,
          });
          recPDC.setValue({
            fieldId: "custrecord_amount_due",
            value: inTotal,
          });
        }

        recPDC.save();
      });

      return;
    }

    arrData.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    const installmentNumbersSorted = objData
      .map((o) => Number(o.installment_number) || 0)
      .sort((a, b) => a - b);

    for (let i = 0; i < installmentNumbersSorted.length; i++) {
      const inst = installmentNumbersSorted[i];
      installmentMap[inst] = {
        due_date: arrData[i]?.due_date ?? null,
        amount: arrData[i]?.amount ?? null,
        amount_due: arrData[i]?.amount ?? null,
      };
    }

    const mergedData = objData.map((item) => {
      const instNum = Number(item.installment_number) || 0;
      return {
        ...item,
        due_date: installmentMap[instNum]?.due_date ?? item.due_date ?? null,
        amount: installmentMap[instNum]?.amount ?? item.amount ?? null,
        amount_due:
          installmentMap[instNum]?.amount_due ?? item.amount_due ?? null,
      };
    });
    log.debug("Merged Data", mergedData);

    mergedData.forEach((data) => {
      const recPDC = record.load({
        type: "customrecord_pdi_post_dated_checks",
        id: data.id,
        isDynamic: true,
      });

      recPDC.setValue({ fieldId: "custrecord_status", value: "Clearing" });
      if (data.due_date) {
        recPDC.setValue({
          fieldId: "custrecord_due_date",
          value: data.due_date,
        });
      }
      if (data.amount) {
        recPDC.setValue({ fieldId: "custrecord_amount", value: data.amount });
      }

      if (data.amount_due) {
        recPDC.setValue({
          fieldId: "custrecord_amount_due",
          value: data.amount_due,
        });
      }

      recPDC.save();
    });
  };

  const approve = (options) => {
    const inStatus = options.newRec.getValue("approvalstatus");

    if (inStatus == 2) {
      const objData = query
        .runSuiteQL({
          query: `SELECT NextTransactionLink.nextDoc FROM transaction
                
                LEFT JOIN NextTransactionLink
                  ON transaction.id = NextTransactionLink.previousdoc
                
                WHERE transaction.id = ${options.newRec.id}`,
        })
        .asMappedResults()[0];

      if (objData) {
        const fldLookUp = search.lookupFields({
          type: record.Type.DEPOSIT_APPLICATION,
          id: objData.nextdoc,
          columns: ["amount", "total"],
        });

        const inCreatedFrom = options.newRec.getValue({
          fieldId: "createdfrom",
        });

        const objDataPDC = query
          .runSuiteQL({
            query: `SELECT pdc.id
                  , pdc.custrecord_amount_due AS amount_due
                  , pdc.custrecord_payment AS payment
                  
                  FROM CUSTOMRECORD_PDI_POST_DATED_CHECKS pdc
                  
                  WHERE pdc.custrecord_related_record = ${inCreatedFrom} AND (custrecord_installment_number = 0 OR custrecord_installment_number = 1)`,
          })
          .asMappedResults()[0];

        if (objDataPDC) {
          const recPDC = record.load({
            type: "customrecord_pdi_post_dated_checks",
            id: objDataPDC.id,
            isDynamic: true,
          });

          recPDC.setValue({
            fieldId: "custrecord_amount_due",
            value: Number(objDataPDC.amount_due) + Number(fldLookUp.amount),
          });
          recPDC.setValue({
            fieldId: "custrecord_payment",
            value: Number(fldLookUp.amount) * -1,
          });
          recPDC.save();
        }
      }
    }
  };

  const deleteUpdate = (options) => {
    let inAmount = 0;

    const inCreatedFrom = options.newRec.getValue({
      fieldId: "createdfrom",
    });

    const fldLookUp = search.lookupFields({
      type: record.Type.SALES_ORDER,
      id: inCreatedFrom,
      columns: ["total"],
    });

    const objData = query
      .runSuiteQL({
        query: `SELECT pdc.id FROM CUSTOMRECORD_PDI_POST_DATED_CHECKS pdc WHERE pdc.custrecord_related_record = ${inCreatedFrom}`,
      })
      .asMappedResults();

    inAmount = Number(fldLookUp.total) / objData.length;

    for (let indx = 0; indx < objData.length; indx++) {
      const recPDC = record.load({
        type: "customrecord_pdi_post_dated_checks",
        id: objData[indx].id,
        isDynamic: true,
      });

      recPDC.setValue({ fieldId: "custrecord_status", value: "Received" });
      recPDC.setValue({
        fieldId: "custrecord_due_date",
        value: "",
      });
      recPDC.setValue({ fieldId: "custrecord_amount", value: inAmount });
      recPDC.setValue({
        fieldId: "custrecord_amount_due",
        value: inAmount,
      });

      recPDC.save();
    }
  };

  const checking = (options) => {
    let isTrue = true;
    let errors = [];

    const inLine = options.currRec.getLineCount({ sublistId: "item" });

    for (let indx = 0; indx < inLine; indx++) {
      const stItem = options.currRec.getSublistText({
        sublistId: "item",
        fieldId: "item",
        line: indx,
      });
      const inAmount = options.currRec.getSublistValue({
        sublistId: "item",
        fieldId: "amount",
        line: indx,
      });
      const inTaxCode = options.currRec.getSublistValue({
        sublistId: "item",
        fieldId: "taxcode",
        line: indx,
      });
      const isExempt = options.currRec.getSublistValue({
        sublistId: "item",
        fieldId: "custcol_pdi_is_exempt",
        line: indx,
      });

      if (inAmount >= 3200000 && inTaxCode != 11 && !isExempt) {
        errors.push(`- Line : ${indx + 1} | Item : (${stItem})`);
        isTrue = false;
      }
    }

    if (!isTrue) {
      dialog.alert({
        title: "Policy Reminder: VAT on Sales ≥ Php 3.2M",
        message:
          'Kindly update the "Tax Code" because the amount is greater than or equal to Php 3.2M.<br><br>' +
          "As stated in our policy:<br>" +
          '"If the Sales Price is Php 3.2M or more, the Contract Price is Vatable; otherwise, it is Non-Vatable."<br><br>' +
          "Affected line(s):<br>" +
          errors.join("<br>") +
          "<br><br>" +
          'Note: In cases where the Sales Price is Php 3.2M or more but the transaction is legitimately Non-Vatable, please review and mark the "Exempt" field accordingly.',
      });
    }

    return isTrue;
  };

  return { updatePDC, approve, deleteUpdate, checking };
});
