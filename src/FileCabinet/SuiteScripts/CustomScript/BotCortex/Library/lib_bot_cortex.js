/**
 * @NApiVersion 2.1
 */
define(["N/runtime", "N/url", "N/https"], (runtime, url, https) => {
  const botMessages = (options) => {
    try {
      const currScript = runtime.getCurrentScript();
      const stApproverHolder = currScript.getParameter({
        name: "custscript_approver_holder",
      });
      const stStatusHolder = currScript.getParameter({
        name: "custscript_status_holder",
      });
      const recId = options.scriptContext.newRecord.id;
      const recType = options.scriptContext.newRecord.type;
      const stDocumentNumber =
        options.scriptContext.newRecord.getValue("tranid");
      const stName = options.scriptContext.newRecord.getText("entity");
      const inAmount = options.scriptContext.newRecord.getValue("total");
      const dtDate = options.scriptContext.newRecord.getText("trandate");

      const urlWebhook = url.resolveScript({
        scriptId: "customscript_sl_bot_cortex",
        deploymentId: "customdeploy_sl_bot_cortex",
        returnExternalUrl: true,
      });

      const suiteletUrl = url.resolveScript({
        scriptId: "customscript_sl_bot_cortex",
        deploymentId: "customdeploy_sl_bot_cortex",
        returnExternalUrl: true,
        params: {
          stApproverHolder: stApproverHolder,
          stStatusHolder: stStatusHolder,
          recId: recId,
          recType: recType,
          stDocumentNumber: stDocumentNumber,
          stName: stName,
          inAmount: inAmount,
          dtDate: dtDate,
          urlWebhook: urlWebhook,
        },
      });

      const response = https.get({ url: suiteletUrl });
      log.debug("Suitelet Response", response.body);

      return "Triggered Suitelet successfully";
    } catch (e) {
      log.error("Error calling Suitelet", e);
      throw e;
    }
  };

  const getSuperAdmin = (getAccountInfo) => {
    const objAccountInfo = JSON.parse(getAccountInfo);
    let superAdminId = null;

    if (
      objAccountInfo &&
      objAccountInfo.members &&
      Array.isArray(objAccountInfo.members)
    ) {
      const isSuperAdmin = objAccountInfo.members.find(
        (m) => m.role === "superadmin"
      );
      if (isSuperAdmin) {
        superAdminId = isSuperAdmin.id;
      }
    }
    return superAdminId;
  };

  return { botMessages, getSuperAdmin };
});
