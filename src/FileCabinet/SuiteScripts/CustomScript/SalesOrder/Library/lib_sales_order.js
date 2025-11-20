/**
 * @NApiVersion 2.1
 */
define(["N/query", "N/ui/dialog", "N/record"], (query, dialog, record) => {
  const itemIsInactive = (options) => {
    let isTrue = true;
    let arrData = [];
    const inLine = options.currRec.getLineCount({ sublistId: "item" });
    for (let indx = 0; indx < inLine; indx++) {
      const inItem = options.currRec.getSublistValue({
        sublistId: "item",
        fieldId: "item",
        line: indx,
      });
      const stItem = options.currRec.getSublistText({
        sublistId: "item",
        fieldId: "item",
        line: indx,
      });

      if (inItem) {
        arrData.push({
          line: indx + 1,
          id: String(inItem),
          name: stItem || "(Unnamed Item)",
        });
      }
    }

    if (arrData.length === 0) return true;

    const uniqueIds = [...new Set(arrData.map((r) => String(r.id)))];
    const inItemId = uniqueIds.join(",");

    const objData = query
      .runSuiteQL({
        query: `SELECT id, isinactive
              FROM item
              WHERE id IN (${inItemId})`,
      })
      .asMappedResults();

    const isInActive = objData
      .filter((row) => row.isinactive === "T" || row.isinactive === true)
      .map((row) => String(row.id));

    if (isInActive.length > 0) {
      const inactiveLines = arrData.filter((r) =>
        isInActive.includes(String(r.id))
      );

      let msg = "The following item(s) are inactive:<br><br>";
      inactiveLines.forEach((r) => {
        msg += `Line ${r.line}: ${r.name}<br>`;
      });
      msg +=
        "<br>These items were recently created. Please follow the approval process to activate them.";

      dialog.alert({
        title: "Inactive Item Detected",
        message: msg,
      });

      isTrue = false;
    }

    return isTrue;
  };

  const customState = (options) => {
    const NsLabelColor = {
      BLUE: "#d5e0ec",
      YELLOW: "#fcf9cf",
      GREEN: "#d7fccf",
      RED: "#fccfcf",
    };
    try {
      const inStatus = options.newRec.getValue("custbody_pdi_approval_status");
      const stStatus = options.newRec.getText("custbody_pdi_approval_status");
      const bgColor = NsLabelColor.YELLOW;

      if (inStatus == 8) {
        options.form.addField({
          id: "custpage_status_label",
          label: "Custom State",
          type: "inlinehtml",
        }).defaultValue = `<script>jQuery(function($){
                              require([], function() {
                                $(".uir-page-title-secondline").append('<div class="uir-record-status" style="background-color: ${bgColor}">${stStatus}</div>');
                              });
                            })</script>`;
      } else if (inStatus == 13) {
        options.form.addField({
          id: "custpage_status_label",
          label: "Custom State",
          type: "inlinehtml",
        }).defaultValue = `<script>jQuery(function($){
                              require([], function() {
                                const checkExist = setInterval(function() {
                                  $status = $(".uir-record-status");
                                  if ($status.length) {
                                    clearInterval(checkExist);
                                    $status.text("${stStatus}");
                                    $status.css({
                                      "background-color": "${bgColor}",
                                      "color": "#000",
                                      "border": "none"
                                    });
                                  }
                                }, 200);
                              });
                            });</script>`;
      }
    } catch (e) {
      log.error("Error", `Error: ${e}`);
    }
  };

  const setStatusForBot = (options) => {
    const inStatus = options.newRec.getValue({
      fieldId: "custbody_pdi_approval_status",
    });
    if (inStatus == 14) {
      record.submitFields({
        type: record.Type.SALES_ORDER,
        id: options.newRec.id,
        values: {
          custbody_pdi_approval_status: 13,
        },
      });
      options.form.addField({
        id: "custpage_reload_script",
        type: "inlinehtml",
        label: "hidden",
      }).defaultValue = `<script>window.location.reload();</script>`;
    }
  };

  return { itemIsInactive, customState, setStatusForBot };
});
