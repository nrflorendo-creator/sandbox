/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(["N/query", "N/file"], (query, file) => {
  const onRequest = (scriptContext) => {
    const objParam = scriptContext.request.parameters;

    const sqlFile = file.load({
      id: "../ITGSeries/itgSeries.sql",
    });

    let sql = sqlFile.getContents();

    let params = [objParam.inBank, objParam.inMethod];

    if (objParam.inUser) {
      sql += " AND series.custrecord_itg_csppm_user = ?";
      params.push(objParam.inUser);
    }

    const objData = query
      .runSuiteQL({
        query: sql,
        params,
      })
      .asMappedResults()[0];

    scriptContext.response.setHeader({
      name: "Content-Type",
      value: "application/json",
    });
    scriptContext.response.write(
      JSON.stringify({ success: true, body: objData })
    );
  };

  return { onRequest };
});
