/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
  "../../Library/lib_btn_remove.js",
  "../../Library/lib_pdc_information.js",
], (remove, pdcInformation) => {
  const beforeLoad = (scriptContext) => {
    if (scriptContext.type === scriptContext.UserEventType.VIEW) {
      remove.btnRemove({
        newRec: scriptContext.newRecord,
        form: scriptContext.form,
      });

      pdcInformation.viewList({
        newRec: scriptContext.newRecord,
        form: scriptContext.form,
      });

      const NsLabelColor = {
        BLUE: "#d5e0ec",
        YELLOW: "#fcf9cf",
        GREEN: "#d7fccf",
        RED: "#fccfcf",
      };
      try {
        const inStatus = scriptContext.newRecord.getValue(
          "custbody_pdi_approval_status"
        );
        if (inStatus == 8) {
          const stStatus = scriptContext.newRecord.getText(
            "custbody_pdi_approval_status"
          );
          const bgColor = NsLabelColor.YELLOW;

          scriptContext.form.addField({
            id: "custpage_status_label",
            label: "Custom State",
            type: "inlinehtml",
          }).defaultValue = `<script>jQuery(function($){
                    require([], function() {
                        $(".uir-page-title-secondline").append('<div class="uir-record-status" style="background-color: ${bgColor}">${stStatus}</div>');
                    });
                })</script>`;
        }
      } catch (e) {
        log.error(
          "Error",
          `Suppressing error encountered while attempting to set the custom state: ${e}`
        );
      }
    }
  };

  return { beforeLoad };
});
