/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(["N/query", "N/ui/dialog"], (query, dialog) => {
  const saveRecord = (scriptContext) => {
    const currRec = scriptContext.currentRecord;
    let blSave = true;
    console.log("currRec.id", currRec.id);

    if (!currRec.id) {
      const inType = currRec.getValue("rectype");
      const inBank = currRec.getValue("custrecord_itg_csppm_accountlink");
      const inMethod = currRec.getValue("custrecord_itg_csppm_paymentmethod");
      const inUser = currRec.getValue("custrecord_itg_csppm_user");

      if (inBank && inMethod && inUser) {
        const objData = query
          .runSuiteQL({
            query: `SELECT
                    series.id,
                    SUBSTR(BUILTIN.DF(series.custrecord_itg_csppm_accountlink), 1, INSTR(BUILTIN.DF(series.custrecord_itg_csppm_accountlink), ' ') - 1 ) AS bank,
                    BUILTIN.DF(series.custrecord_itg_csppm_paymentmethod) AS method,
                    BUILTIN.DF(series.custrecord_itg_csppm_user) AS user
                
                FROM CUSTOMRECORD_ITG_CHECKSERIESPERPAYMETHOD series
                
                WHERE series.custrecord_itg_csppm_accountlink = ${inBank} AND series.custrecord_itg_csppm_paymentmethod = ${inMethod} AND series.custrecord_itg_csppm_user = ${inUser}`,
          })
          .asMappedResults()[0];

        console.log("objData", objData);

        if (objData) {
          const stMessage = `The combination of:<br>- Bank: "${objData.bank}"<br>- Payment Method: "${objData.method}"<br>- User: "${objData.user}"<br>is already in use.<br><br>Would you like to open the existing record?`;

          dialog
            .confirm({
              title: "Duplicate Combination Found",
              message: stMessage,
            })
            .then(function (result) {
              if (result) {
                const baseUrl = window.location.origin;
                window.open(
                  `${baseUrl}/app/common/custom/custrecordentry.nl?rectype=${inType}&id=${objData.id}`,
                  "_blank"
                );
              }
            });

          blSave = false;
        }
      }
    }

    return blSave;
  };

  return { saveRecord };
});
