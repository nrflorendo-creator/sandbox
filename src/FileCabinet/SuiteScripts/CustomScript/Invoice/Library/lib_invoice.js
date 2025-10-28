/**
 * @NApiVersion 2.1
 */
define(["N/query", "N/record", "N/ui/dialog", "N/search"], (
  query,
  record,
  dialog,
  search
) => {
  const createPDC = (options) => {
    const arrData = [];

    const recInvoice = record.load({
      type: options.newRec.type,
      id: options.newRec.id,
      isDynamic: false,
    });

    const inSalesOrderId = recInvoice.getValue("createdfrom");

    const inLine = recInvoice.getLineCount({
      sublistId: "installment",
    });

    for (let indx = 0; indx < inLine; indx++) {
      const inInstallmentNumber = recInvoice.getSublistValue({
        sublistId: "installment",
        fieldId: "seqnum",
        line: indx,
      });
      const dtDueDate = recInvoice.getSublistValue({
        sublistId: "installment",
        fieldId: "duedate",
        line: indx,
      });
      const inAmount = recInvoice.getSublistValue({
        sublistId: "installment",
        fieldId: "amount",
        line: indx,
      });
      const inAmountDue = recInvoice.getSublistValue({
        sublistId: "installment",
        fieldId: "amountdue",
        line: indx,
      });

      arrData.push({
        installment_number: inInstallmentNumber,
        due_date: dtDueDate,
        amount: inAmount,
        amount_due: inAmountDue,
      });
    }
    log.debug("arrData", arrData);

    if (arrData.length === 0) {
      const recPDC = record.create({
        type: "customrecord_pdi_post_dated_checks",
        isDynamic: true,
      });

      recPDC.setValue({ fieldId: "name", value: "Pending user entry" });
      recPDC.setValue({
        fieldId: "custrecord_main_record",
        value: inSalesOrderId,
      });
      recPDC.setValue({
        fieldId: "custrecord_related_record",
        value: recInvoice.id,
      });
      recPDC.setValue({
        fieldId: "custrecord_due_date",
        value: recInvoice.getValue("duedate"),
      });
      recPDC.setValue({
        fieldId: "custrecord_amount",
        value: recInvoice.getValue("subtotal"),
      });
      recPDC.setValue({
        fieldId: "custrecord_amount_due",
        value: recInvoice.getValue("subtotal"),
      });
      recPDC.setValue({ fieldId: "custrecord_installment_number", value: 0 });
      recPDC.setValue({ fieldId: "custrecord_status", value: "Received" });

      const recId = recPDC.save();
    } else {
      arrData.forEach((data) => {
        const recPDC = record.create({
          type: "customrecord_pdi_post_dated_checks",
          isDynamic: true,
        });

        recPDC.setValue({ fieldId: "name", value: "Pending user entry" });
        recPDC.setValue({
          fieldId: "custrecord_main_record",
          value: inSalesOrderId,
        });
        recPDC.setValue({
          fieldId: "custrecord_related_record",
          value: recInvoice.id,
        });
        recPDC.setValue({
          fieldId: "custrecord_due_date",
          value: data.due_date,
        });
        recPDC.setValue({
          fieldId: "custrecord_amount",
          value: data.amount,
        });
        recPDC.setValue({
          fieldId: "custrecord_amount_due",
          value: data.amount_due,
        });
        recPDC.setValue({
          fieldId: "custrecord_installment_number",
          value: data.installment_number,
        });
        recPDC.setValue({ fieldId: "custrecord_status", value: "Received" });

        const recId = recPDC.save();
      });
    }
  };

  const updatePDC = (options) => {
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
      log.debug("objData", objData);

      if (objData && objData.nextdoc) {
        const fldLookUp = search.lookupFields({
          type: record.Type.DEPOSIT_APPLICATION,
          id: objData.nextdoc,
          columns: ["amount", "total"],
        });

        const inCreatedFrom = options.newRec.getValue("createdfrom");

        const objDataPDC = query
          .runSuiteQL({
            query: `SELECT pdc.id
                  , pdc.custrecord_amount_due AS amount_due
                  , pdc.custrecord_payment AS payment
                  
                  FROM CUSTOMRECORD_PDI_POST_DATED_CHECKS pdc
                  
                  WHERE pdc.custrecord_main_record = ${inCreatedFrom} AND pdc.custrecord_installment_number IN (0, 1)
                  ORDER BY pdc.custrecord_installment_number DESC
                  FETCH FIRST 1 ROWS ONLY`,
          })
          .asMappedResults()[0];
        log.debug("objDataPDC", objDataPDC);

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
          recPDC.setValue({ fieldId: "custrecord_status", value: "Clearing" });
          recPDC.save();
        }
      }
    }
  };

  const deletePDC = (options) => {
    const inInvoiceId = options.newRec.id;

    const objData = query
      .runSuiteQL({
        query: `SELECT pdc.id FROM CUSTOMRECORD_PDI_POST_DATED_CHECKS pdc WHERE pdc.custrecord_related_record = ${inInvoiceId}`,
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
  };

  const addField = (options) => {
    const fldTerms = options.form.addField({
      id: "custpage_terms",
      type: options.fldType.SELECT,
      label: "Terms (c)",
      container: "billingtablnk",
    });
    fldTerms.isMandatory = true;

    options.form.insertField({
      field: fldTerms,
      isBefore: true,
      nextfield: "terms",
    });
  };

  const initialMessage = (options) => {
    const objSublist = options.currRec.getSublist({
      sublistId: "item",
    });
    var objColumn = objSublist.getColumn({
      fieldId: "currentpercent",
    });
    objColumn.isDisabled = true;

    dialog.alert({
      title: "Important Notice",
      message:
        'Make sure the "Is Down Payment" line field is checked if this Invoice is for a downpayment.<br><br>' +
        "This allows the system to automatically update the line items with the correct percentage and amount..",
    });

    const fldTerms = options.currRec.getField("custpage_terms");

    const objSelectOption = query
      .runSuiteQL({
        query: `SELECT term.id, term.name
        
        FROM term
        
        WHERE UPPER(term.name) LIKE 'PDI%'`,
      })
      .asMappedResults();

    objSelectOption.forEach((data) => {
      fldTerms.insertSelectOption({
        value: data.id,
        text: data.name,
      });
    });
  };

  const updateCurrentPercentage = (options) => {
    if (options.fldId === "custcol_pdi_is_down_payment") {
      const isDownPayment = options.currRec.getCurrentSublistValue({
        sublistId: "item",
        fieldId: "custcol_pdi_is_down_payment",
      });

      if (isDownPayment) {
        options.currRec.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "currentpercent",
          value: 20,
        });
      } else {
        options.currRec.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "currentpercent",
          value: 0,
        });
        const inAmountOrdered = options.currRec.getCurrentSublistValue({
          sublistId: "item",
          fieldId: "amountordered",
        });
        options.currRec.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "amount",
          value: inAmountOrdered,
        });
      }
    }
  };

  const fldChanged = (options) => {
    if (options.fieldId === "custpage_terms") {
      const inTerms = options.currRec.getValue("custpage_terms");

      options.currRec.setValue({
        fieldId: "terms",
        value: inTerms,
      });
    }
  };

  const checkLineAmount = (options) => {
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

  return {
    createPDC,
    updatePDC,
    deletePDC,
    addField,
    initialMessage,
    fldChanged,
    updateCurrentPercentage,
    checkLineAmount,
  };
});
