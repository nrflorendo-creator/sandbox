/**
 * @NApiVersion 2.1
 */
define(["N/query", "N/record"], (query, record) => {
  const autoPopulateFields = (options) => {
    const stParam = options.currRec.getValue({
      fieldId: "entryformquerystring",
    });
    const params = new URLSearchParams(stParam);
    const inCreditMemoId = params.get("cred");

    const recCreditMemo = record.load({
      type: record.Type.CREDIT_MEMO,
      id: inCreditMemoId,
    });

    const inDepartment = recCreditMemo.getValue({
      fieldId: "department",
    });
    const inLocation = recCreditMemo.getValue({
      fieldId: "location",
    });

    options.currRec.setValue({
      fieldId: "department",
      value: inDepartment,
    });
    options.currRec.setValue({
      fieldId: "location",
      value: inLocation,
    });

    const fldRefundMethod = options.currRec.getField("custpage_refund_method");

    const objSelectOption = query
      .runSuiteQL({
        query: `SELECT paymentmethod.id, paymentmethod.name
        
        FROM paymentmethod
        
        WHERE UPPER(paymentmethod.name) LIKE 'PDI%'`,
      })
      .asMappedResults();

    objSelectOption.forEach((data) => {
      fldRefundMethod.insertSelectOption({
        value: data.id,
        text: data.name,
      });
    });
  };

  const disabledFields = (options) => {
    const fldCheckNumber = options.newRec.getField({
      fieldId: "tranid",
    });
    fldCheckNumber.isDisabled = true;
  };

  const toProcessCancelSO = (options) => {
    let inApplyId = "";

    const inLine = options.newRec.getLineCount({
      sublistId: "apply",
    });

    for (let indx = 0; indx < inLine; indx++) {
      const inApply = options.newRec.getSublistValue({
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
        custbody_pdi_next_approver: 3,
      },
    });

    const objDataPDC = query
      .runSuiteQL({
        query: `SELECT pdc.id FROM CUSTOMRECORD_PDI_POST_DATED_CHECKS pdc WHERE pdc.custrecord_main_record = ${objData.salesorder_id}`,
      })
      .asMappedResults();
    log.debug("objDataPDC", objDataPDC);

    objDataPDC.forEach((row) => {
      record.submitFields({
        type: "customrecord_pdi_post_dated_checks",
        id: row.id,
        values: {
          isinactive: true,
        },
      });
    });
  };

  const addField = (options) => {
    const fldRefundMethod = options.form.addField({
      id: "custpage_refund_method",
      type: options.fldType.SELECT,
      label: "Refund Method (c)",
      container: "payment",
    });
    if (options.type !== "edit") {
      fldRefundMethod.isMandatory = true;
    }

    options.form.insertField({
      field: fldRefundMethod,
      isBefore: true,
      nextfield: "paymentmethod",
    });
  };

  const fldChanged = (options) => {
    if (options.fieldId === "custpage_refund_method") {
      const inPaymentMethod = options.currRec.getValue(
        "custpage_refund_method"
      );

      options.currRec.setValue({
        fieldId: "paymentmethod",
        value: inPaymentMethod,
      });
    }
  };

  const checkingCheckNumber = (options) => {
    let isTrue = true;
    const isPaymentMethod = options.currRec.getValue("custpage_refund_method");

    if (isPaymentMethod == 15) {
      dialog.alert({
        title: "Missing Required Field",
        message: `Please fill in the Check Number field.<br><br> This field is required when Cheque is selected as the Payment Method.`,
      });
      isTrue = false;
    }

    return isTrue;
  };

  return {
    autoPopulateFields,
    disabledFields,
    toProcessCancelSO,
    addField,
    fldChanged,
    checkingCheckNumber,
  };
});
