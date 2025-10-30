/**
 * @NApiVersion 2.1
 */
define(["N/runtime", "N/url", "N/https"], (runtime, url, https) => {
  const botMessages = (options) => {
    try {
      const currScript = runtime.getCurrentScript();
      const scriptParam = currScript.getParameter({
        name: "custscript_approver_holder",
      });
      const recId = options.scriptContext.newRecord.id;
      const recType = options.scriptContext.newRecord.type;
      const stDocumentNumber =
        options.scriptContext.newRecord.getValue("tranid");
      const stCustomerName = options.scriptContext.newRecord.getText("entity");
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
          urlWebhook: urlWebhook,
          recId: recId,
          recType: recType,
          stDocumentNumber: stDocumentNumber,
          stCustomerName: stCustomerName,
          inAmount: inAmount,
          dtDate: dtDate,
          scriptParam: scriptParam,
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
