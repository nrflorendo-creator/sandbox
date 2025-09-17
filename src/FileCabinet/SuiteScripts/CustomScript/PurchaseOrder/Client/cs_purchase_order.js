/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(["N/url"], function (url) {
  /**
   * Function to be executed after page is initialized.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
   *
   * @since 2015.2
   */
  const pageInit = (scriptContext) => {};

  const btnReject = (recId) => {
    const blConfirm = confirm("Are you sure you want to reject/close this PO? This action cannot be undone. You will need to create a new PR and PO.");

    if (blConfirm) {
      const slUrl = url.resolveScript({
        scriptId: "customscript_sl_purchase_order",
        deploymentId: "customdeploy_sl_purchase_order",
        params: {
          recId: recId,
        },
      });

      fetch(slUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            location.reload();
          } else {
            alert("Failed: " + (data.message || "Unknown error"));
          }
        })
        .catch((err) => {
          alert("Error: " + err.message);
        });
    }
  };

  return {
    pageInit,
    btnReject,
  };
});
