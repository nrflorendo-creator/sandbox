/**
 * @NApiVersion 2.1
 */
define(["N/query", "N/ui/serverWidget", "N/url"], (
  query,
  serverWidget,
  url
) => {
  const viewList = (options) => {
    const inId = options.newRec.id;
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
                  
                  WHERE pdc.custrecord_main_record = ${inId}`,
      })
      .asMappedResults();

    let sublist = options.form.addSublist({
      id: "custpage_pdc_information",
      type: serverWidget.SublistType.LIST,
      label: "PDC Information",
      tab: "billingtab",
    });

    sublist.addField({
      id: "custpage_pdc_view",
      type: serverWidget.FieldType.TEXT,
      label: `View`,
    });

    log.debug("objData -> lib_pdc_information", objData);
    if (objData && objData.length > 0) {
      let keys = Object.keys(objData[0]);
      keys.forEach((key) => {
        sublist.addField({
          id: "custpage_" + key,
          type: serverWidget.FieldType.TEXT,
          label: `${key.replace(/_/g, " ").toUpperCase()}`,
        });
      });

      objData.forEach((row, line) => {
        let recordUrl = url.resolveRecord({
          recordType: "customrecord_pdi_post_dated_checks",
          recordId: row.id,
          isEditMode: false,
        });
        sublist.setSublistValue({
          id: "custpage_pdc_view",
          line: line,
          value: `<a href="${recordUrl}" target="_blank" style="color: blue;">View</a>`,
        });

        keys.forEach((key) => {
          let value = row[key];

          if (key === "amount" || key === "amount_due" || key === "payment") {
            const num = parseFloat(value || 0);
            value = num.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }

          sublist.setSublistValue({
            id: "custpage_" + key,
            line: line,
            value: `${value}`,
          });
        });
      });
    } else {
      sublist.setSublistValue({
        id: "custpage_pdc_view",
        line: 0,
        value: `No PDC information found.`,
      });
    }
  };

  return { viewList };
});
