/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(["N/runtime", "N/https", "N/url", "../Library/lib_bot_cortex.js"], (
  runtime,
  https,
  url,
  lib
) => {
  const getAuthToken = () => {
    try {
      const currScript = runtime.getCurrentScript();
      const scriptParam = currScript.getParameter({
        name: "custscript_auth_token",
      });
      if (scriptParam && String(scriptParam).trim())
        return String(scriptParam).trim();
    } catch (e) {
      log.error("Auth token read failed", e);
      return "YOUR_CHANNEL_AUTH_TOKEN";
    }
  };

  const onRequest = (scriptContext) => {
    try {
      log.debug("Method", scriptContext.request.method);
      let stMessage = null;
      let urlWebhook = null;
      let bodyData = {};

      const authToken = getAuthToken();
      log.debug("Auth Token", authToken);

      if (scriptContext.request.method === "GET") {
        log.debug("GET param", scriptContext.request.parameters);
        urlWebhook = scriptContext.request.parameters.urlWebhook;
        recId = scriptContext.request.parameters.recId;
        recType = scriptContext.request.parameters.recType;
        stDocumentNumber = scriptContext.request.parameters.stDocumentNumber;
        scriptParam = scriptContext.request.parameters.scriptParam;
      } else if (scriptContext.request.method === "POST") {
        const body = scriptContext.request.body || "{}";
        bodyData = JSON.parse(body);
        log.debug("POST bodyData", bodyData);
      }

      if (bodyData.event === "webhook") {
        scriptContext.response.write("ok");
        return;
      }

      const getAccountInfoResponse = https.post({
        url: "https://chatapi.viber.com/pa/get_account_info",
        body: JSON.stringify({
          auth_token: authToken,
        }),
        headers: { "Content-Type": "application/json" },
      });
      log.debug("get_account_info Response", getAccountInfoResponse.body);

      const superAdminId = lib.getSuperAdmin(getAccountInfoResponse.body);
      log.debug("SuperAdmin ID", superAdminId);

      const setWebhookResponse = https.post({
        url: "https://chatapi.viber.com/pa/set_webhook",
        body: JSON.stringify({
          url: urlWebhook,
          auth_token: authToken,
        }),
        headers: { "Content-Type": "application/json" },
      });
      log.debug("set_webhook Response", setWebhookResponse.body);

      const recordUrl = url.resolveRecord({
        recordType: recType,
        recordId: recId,
        isEditMode: false,
      });
      const domain = url.resolveDomain({
        hostType: url.HostType.APPLICATION,
      });
      const fullUrl = `https://${domain}${recordUrl}`;
      log.debug("Full Record URL", fullUrl);

      if (scriptParam == "Approved") {
        stMessage = `Sales Order #${stDocumentNumber} has been *approved*.\n\nYou can view the document using the link below:\n${fullUrl}`;
      } else {
        stMessage = `Sales Order #${stDocumentNumber} is pending approval from the ${scriptParam}.\n\nPlease review the document using the link below:\n${fullUrl}`;
      }

      const postMessageResponse = https.post({
        url: "https://chatapi.viber.com/pa/post",
        body: JSON.stringify({
          auth_token: authToken,
          from: superAdminId,
          type: "text",
          text: stMessage,
        }),
        headers: { "Content-Type": "application/json" },
      });
      log.debug("post Response", postMessageResponse.body);

      scriptContext.response.setHeader("Content-Type", "application/json");
      scriptContext.response.write(
        JSON.stringify({
          status: "success",
          message: "Viber webhook and message sent successfully",
        })
      );
    } catch (e) {
      log.error("Error in Suitelet", e);
      scriptContext.response.setHeader("Content-Type", "application/json");
      scriptContext.response.write(
        JSON.stringify({ status: "error", message: e.message })
      );
    }
  };

  return { onRequest };
});
