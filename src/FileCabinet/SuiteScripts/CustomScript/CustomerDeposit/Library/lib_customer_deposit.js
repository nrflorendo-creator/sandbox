/**
 * @NApiVersion 2.1
 */
define(["N/query", "N/ui/dialog"], (query, dialog) => {
  const pageLoad = (options) => {
    const fldPaymentAmount = options.currRec.getField("payment");
    fldPaymentAmount.isDisabled = true;
    const inCreatedFrom = options.currRec.getValue("salesorder");

    const objData = query
      .runSuiteQL({
        query: `SELECT transactionLine.department AS indepartment
        , transactionLine.location AS inlocation
        
        FROM transaction
        
        LEFT JOIN transactionLine
            ON transaction.id = transactionLine.transaction
        
        WHERE transaction.id = ${inCreatedFrom} AND transactionLine.mainLine = 'T'`,
      })
      .asMappedResults()[0];

    options.currRec.setValue({
      fieldId: "payment",
      value: 20000,
    });
    options.currRec.setValue({
      fieldId: "department",
      value: objData.indepartment,
    });
    options.currRec.setValue({
      fieldId: "location",
      value: objData.inlocation,
    });

    const fldPaymentMethod = options.currRec.getField(
      "custpage_payment_method"
    );

    const objSelectOption = query
      .runSuiteQL({
        query: `SELECT paymentmethod.id, paymentmethod.name
        
        FROM paymentmethod
        
        WHERE UPPER(paymentmethod.name) LIKE 'PDI%'`,
      })
      .asMappedResults();

    objSelectOption.forEach((data) => {
      fldPaymentMethod.insertSelectOption({
        value: data.id,
        text: data.name,
      });
    });
  };

  const fldChanged = (options) => {
    if (options.fieldId === "custpage_payment_method") {
      const inPaymentMethod = options.currRec.getValue(
        "custpage_payment_method"
      );

      options.currRec.setValue({
        fieldId: "paymentmethod",
        value: inPaymentMethod,
      });
    }
  };

  const checkingCheckNumber = (options) => {
    let isTrue = true;
    const isPaymentMethod = options.currRec.getValue("custpage_payment_method");

    if (isPaymentMethod == 15) {
      dialog.alert({
        title: "Missing Required Field",
        message: `Please fill in the Check Number field.<br><br> This field is required when Cheque is selected as the Payment Method.`,
      });
      isTrue = false;
    }

    return isTrue;
  };

  const addField = (options) => {
    const fldPaymentMethod = options.form.addField({
      id: "custpage_payment_method",
      type: options.fldType.SELECT,
      label: "Payment Method (c)",
      container: "payment",
    });
    if (options.type !== "edit") {
      fldPaymentMethod.isMandatory = true;
    }

    options.form.insertField({
      field: fldPaymentMethod,
      isBefore: true,
      nextfield: "paymentmethod",
    });
  };

  return { pageLoad, fldChanged, checkingCheckNumber, addField };
});
