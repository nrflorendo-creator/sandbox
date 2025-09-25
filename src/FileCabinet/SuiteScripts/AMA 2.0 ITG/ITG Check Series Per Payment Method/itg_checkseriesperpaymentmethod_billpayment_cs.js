/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(["N/runtime", "N/url", "N/https", "N/ui/dialog"], (
  runtime,
  url,
  https,
  dialog
) => {
  const currentUser = runtime.getCurrentUser();
  const pageInit = (scriptContext) => {
    const currRec = scriptContext.currentRecord;
    if (scriptContext.mode === "copy") {
      currRec.setValue("custbody15", "");
    }
  };

  const fieldChanged = (scriptContext) => {
    const currRec = scriptContext.currentRecord;
    if (!currRec.id) {
      const stType = "field_changed";
      const fldId = scriptContext.fieldId;
      const sublistId = scriptContext.sublistId;

      const inBank = currRec.getValue("account");
      const inMethod = currRec.getValue("custbody15");
      const inUser = currentUser.id;

      if (
        (fldId === "account" || fldId === "custbody15") &&
        sublistId !== "expense"
      ) {
        if (fldId === "account") {
          currRec.setValue("custbody15", "");
        }
        checkingBackEnd({
          stType: stType,
          inBank: inBank,
          inMethod: inMethod,
          inUser: inUser,
          currRec: currRec,
        });
      }
    }
  };

  const saveRecord = (scriptContext) => {
    const currRec = scriptContext.currentRecord;

    if (!currRec.id) {
      const stType = "save_record";
      const inBank = currRec.getValue("account");
      const inMethod = currRec.getValue("custbody15");
      const inUser = currentUser.id;

      if (!inBank || !inMethod) {
        return true;
      }

      const blSave = checkingBackEnd({
        stType: stType,
        inBank: inBank,
        inMethod: inMethod,
        inUser: inUser,
      });
      console.log("blSave", blSave);

      return blSave;
    }
  };

  function checkingBackEnd(options) {
    console.log("data", options);
    if (options.inBank && options.inMethod) {
      const slUrl = url.resolveScript({
        scriptId: "customscript_sl_itg_series",
        deploymentId: "customdeploy_sl_itg_series",
        params: {
          inBank: options.inBank,
          inMethod: options.inMethod,
          inUser: options.inBank != 1 ? options.inUser : "",
        },
      });

      const response = https.get({ url: slUrl });
      const data = JSON.parse(response.body);

      if (data.success) {
        console.log("data.body", data.body);
        if (data.body) {
          let nextSeries = 0;
          const inCurrent = Number(data.body.current);
          const inMaximum = Number(data.body.maximum);

          const remaining = inMaximum - inCurrent;

          if (inCurrent >= inMaximum) {
            dialog.alert({
              title: "Maximum Check Series Reached",
              message: `The maximum assigned check series ("${inMaximum}") has been reached.<br><br>Please contact your administrator to update the check series setup.`,
            });
            return false;
          } else {
            console.log("else less than");
            nextSeries = inCurrent + 1;

            if (options.stType == "field_changed") {
              options.currRec.setValue("tranid", nextSeries);
              if (remaining > 1 && remaining <= 3) {
                dialog.alert({
                  title: "Check Series Running Low",
                  message: `Only ${remaining} check numbers remain out of the assigned maximum of "${inMaximum}".<br><br>Please be aware that you will need to contact your administrator once the last check number has been used so the check series setup can be updated.`,
                });
              } else if (remaining === 1) {
                dialog.alert({
                  title: "Final Check Number Remaining",
                  message: `Only <b>1 check number</b> remains out of the assigned maximum of "${inMaximum}".<br><br>After you save this last check, please notify your administrator immediately so they can update the check series setup.`,
                });
              }
            }

            if (options.stType == "save_record") {
              if (data.body.id == 472) {
                // 269816 : Admin Internal ID (Florendo, John Nathaniel R)
                const allowedUsers = [269816, 225854, 32839, 245274];

                if (allowedUsers.includes(options.inUser)) {
                  return true;
                } else {
                  dialog.alert({
                    title: "Access Restricted",
                    message:
                      "You are not allowed to use this check series.<br><br>Please contact the administrator for assistance.",
                  });
                  return false;
                }
              } else {
                return true;
              }
            }
          }
        } else {
          dialog.alert({
            title: "No Check Series Assigned",
            message:
              "No check series has been assigned to your employee record.<br><br>Please contact the administrator for assistance.",
          });
          return false;
        }
      } else {
        dialog.alert({
          title: "Operation Failed",
          message: data.message || "Unknown error",
        });
      }
    }
  }

  return { pageInit, fieldChanged, saveRecord };
});
