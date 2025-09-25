/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["N/runtime", "N/file", "N/query", "N/record"], (
  runtime,
  file,
  query,
  record
) => {
  const currentUser = runtime.getCurrentUser();

  const afterSubmit = (scriptContext) => {
    const newRec = scriptContext.newRecord;

    if (scriptContext.type === scriptContext.UserEventType.CREATE) {
      const inBank = newRec.getValue("account");
      const inMethod = newRec.getValue("custbody15");
      const inUser = currentUser.id;

      const sqlFile = file.load({
        id: "../../CustomScript/Library/ITGSeries/itgSeries.sql",
      });

      let sql = sqlFile.getContents();

      let params = [inBank, inMethod];

      if (inBank != 1) {
        if (inUser) {
          sql += " AND series.custrecord_itg_csppm_user = ?";
          params.push(inUser);
        }
      }

      const objData = query
        .runSuiteQL({
          query: sql,
          params,
        })
        .asMappedResults()[0];
      log.debug("objData", objData);

      let nextSeries = 0;
      const inCurrent = Number(objData.current);
      nextSeries = inCurrent + 1;

      record.submitFields({
        type: "customrecord_itg_checkseriesperpaymethod",
        id: objData.id,
        values: {
          custrecord_itg_csppm_nextcheckseries: nextSeries,
        },
      });
    }
  };

  return { afterSubmit };
});
