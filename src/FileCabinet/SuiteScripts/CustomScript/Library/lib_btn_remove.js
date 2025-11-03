/**
 * @NApiVersion 2.1
 */
define(["N/query"], (query) => {
  const btnRemove = (options) => {
    const recType = options.newRec.type;
    log.debug("recType -> lib_btn_remove", recType);

    const inStatus = options.newRec.getValue({
      fieldId:
        recType == "inventoryitem" || recType == "noninventoryitem"
          ? "custitem_pdi_approval_status"
          : recType == "customerdeposit"
          ? "status"
          : "custbody_pdi_approval_status",
    });

    if (recType === "customerdeposit") {
      const stStatus = options.newRec.getValue({ fieldId: "status" });
      if (stStatus == "Fully Applied") {
        options.form.removeButton({ id: "edit" });
      }
    } else {
      if (inStatus != 2) {
        options.form.removeButton({
          id: "edit",
        });
      }

      if (inStatus != 9) {
        options.form.removeButton({
          id: "closeremaining",
        });
      }
    }

    options.form.removeButton({
      id: "renewal",
    });

    if (recType == "noninventoryitem") {
      options.form.removeButton({
        id: "convertinvt",
      });
    }

    orderToCash({
      newRec: options.newRec,
      form: options.form,
      inStatus: inStatus,
    });

    // if (options.inStatus != 12) {
    //   options.form.removeButton({
    //     id: "confirmpayment",
    //   });
    //   options.form.removeButton({
    //     id: "decline",
    //   });
    // }
  };

  function orderToCash(param) {
    salesOrder(param);
  }

  function salesOrder(param) {
    const newRec = param.newRec;
    const form = param.form;
    const inStatus = param.inStatus;

    if (newRec.type == "salesorder") {
      if (inStatus != 6) {
        const inButtonIds = ["approve", "cancelorder", "createdeposit"];

        for (const id of inButtonIds) {
          form.removeButton({ id });
        }
      }
      if (inStatus == 8) {
        form.removeButton({ id: "billremaining" });
      }

      const objData = query
        .runSuiteQL({
          query: `SELECT BUILTIN.DF(relatedRecord.status) AS ststatus
                , NextTransactionLink.linkType AS sttype
                , relatedRecord.custbody_pdi_related_record AS strelatedrecord
                FROM transaction

                LEFT JOIN NextTransactionLink
                    ON transaction.id = NextTransactionLink.previousdoc
                LEFT JOIN transaction relatedRecord
                    ON NextTransactionLink.nextdoc = relatedRecord.id

                WHERE transaction.id = ${newRec.id}`,
        })
        .asMappedResults();

      if (!objData[0].ststatus && !objData[0].sttype) {
        const buttonIds = ["billremaining", "process"];

        for (const id of buttonIds) {
          form.removeButton({ id });
        }
      }

      for (const result of objData) {
        let buttonIds = [];

        if (
          (result.sttype === "OrdDep" &&
            result.ststatus === "Customer Deposit : Not Deposited") ||
          (result.sttype === "OrdBill" &&
            result.ststatus !== "Invoice : Paid In Full")
        ) {
          buttonIds = ["process", "createdeposit"];
        } else if (
          result.sttype === "OrdBill" &&
          result.ststatus === "Invoice : Paid In Full"
        ) {
          buttonIds = ["createdeposit"];
          if (result.strelatedrecord) {
            buttonIds = ["process", "createdeposit", "billremaining"];
          }
        }

        for (const id of buttonIds) {
          form.removeButton({ id });
        }
      }
    }
  }

  return { btnRemove };
});
