/**
 * @NApiVersion 2.1
 */
define(["N/query"], (query) => {
  const load = (options) => {
    const inCreatedFrom = options.currRec.getValue("salesorder");

    const objData = query
      .runSuiteQL({
        query: `SELECT transactionLine.department AS indepartment
        , transactionLine.location AS inlocation
        
        FROM transaction
        
        LEFT JOIN transactionLine
            ON transaction.id = transactionLine.transaction
        
        WHERE transaction.id = ${inCreatedFrom} AND transactionLine.mainLine = 'T'`,
      })
      .asMappedResults()[0];

    options.currRec.setValue({
      fieldId: "payment",
      value: 20000,
    });
    options.currRec.setValue({
      fieldId: "department",
      value: objData.indepartment,
    });
    options.currRec.setValue({
      fieldId: "location",
      value: objData.inlocation,
    });
  };

  return { load };
});
