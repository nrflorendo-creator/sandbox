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
        name: "custscript_object_auth_token",
      });

      return scriptParam ? JSON.parse(scriptParam) : {};
    } catch (e) {
      log.error("Auth token read failed", e);
      return "YOUR_CHANNEL_AUTH_TOKEN";
    }
  };

  const onRequest = (scriptContext) => {
    try {
      log.debug("Method", scriptContext.request.method);
      let stMessage = null;
      let bodyData = {};

      if (scriptContext.request.method === "GET") {
        log.debug("GET param", scriptContext.request.parameters);
        stApproverHolder = scriptContext.request.parameters.stApproverHolder;
        stStatusHolder = scriptContext.request.parameters.stStatusHolder;
        recId = scriptContext.request.parameters.recId;
        recType = scriptContext.request.parameters.recType;
        stDocumentNumber = scriptContext.request.parameters.stDocumentNumber;
        stName = scriptContext.request.parameters.stName;
        inAmount = scriptContext.request.parameters.inAmount;
        dtDate = scriptContext.request.parameters.dtDate;
        urlWebhook = scriptContext.request.parameters.urlWebhook;
      } else if (scriptContext.request.method === "POST") {
        const body = scriptContext.request.body || "{}";
        bodyData = JSON.parse(body);
      }

      if (bodyData.event === "webhook") {
        scriptContext.response.write("ok");
        return;
      }

      if (stApproverHolder == null || stApproverHolder === "") {
        stApproverHolder =
          stStatusHolder == "Draft" || stStatusHolder == "Approved"
            ? "User Notification"
            : "";
        stStatusHolder = stStatusHolder == "Draft" ? "Rejected" : "Approved";
      }

      let stLabelName = "";
      if (recType == "vendorbill") {
        stLabelName = "Supplier";
      } else if (recType == "salesorder") {
        stLabelName = "Customer";
      }

      const objAuthToken = getAuthToken();
      log.debug("Auth Token Object", objAuthToken);
      const keyApprover = stApproverHolder.toLowerCase().replace(/\s+/g, "_");
      log.debug("Key Approver", keyApprover);
      const authToken = objAuthToken[keyApprover];
      log.debug("Auth Token", authToken);

      const getAccountInfoResponse = https.post({
        url: "https://chatapi.viber.com/pa/get_account_info",
        body: JSON.stringify({
          auth_token: authToken,
        }),
        headers: { "Content-Type": "application/json" },
      });
      log.debug("Account Info Response", getAccountInfoResponse.body);

      const setWebhookResponse = https.post({
        url: "https://chatapi.viber.com/pa/set_webhook",
        body: JSON.stringify({
          url: urlWebhook,
          auth_token: authToken,
        }),
        headers: { "Content-Type": "application/json" },
      });
      log.debug("Set Webhook Response", setWebhookResponse.body);

      const recordUrl = url.resolveRecord({
        recordType: recType,
        recordId: recId,
        isEditMode: false,
      });
      const domain = url.resolveDomain({
        hostType: url.HostType.APPLICATION,
      });
      const fullUrl = `https://${domain}${recordUrl}`;

      let formattedAmount = Number(inAmount || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      // === NOTE: Don't move the value inside of `` because when you move it, the message will also move. Thank you!! ===
      const baseMessage = `
A transaction needs your approval.

Document #: ${stDocumentNumber}
${stLabelName}: ${stName}
Amount: ${formattedAmount}

Please comment if this transaction is already approved for your reference.

View details:
${fullUrl}
`;

      const userMessage = `
New update showing status: ${stStatusHolder} for Document #: ${stDocumentNumber}.

View details:
${fullUrl}
`;

      const messageConfig = {
        accounting_director: baseMessage,
        ama_chief_financial_officer: baseMessage,
        user_notification: userMessage,
        ama_ap_manager: baseMessage,
        ama_audit: baseMessage,
        ama_chief_audit_executive: baseMessage,
      };
      stMessage = messageConfig[keyApprover];

      const superAdminId = lib.getSuperAdmin(getAccountInfoResponse.body);
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
