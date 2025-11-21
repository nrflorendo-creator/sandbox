/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(["N/ui/serverWidget", "N/query"], (serverWidget, query) => {
  const onRequest = (scriptContext) => {
    const form = serverWidget.createForm({ title: "Lookup Tables Viewer" });

    form.addTab({ id: "custpage_tab_main", label: "Lookup Data" });

    const tables = [
      {
        id: "subsidiary",
        label: "Subsidiaries",
        sql: `SELECT id AS internalid, name, legalname, federalIdNumber AS vatnumber FROM subsidiary WHERE isinactive = 'F' ORDER BY internalid`,
      },
      {
        id: "account",
        label: "Accounts",
        sql: `SELECT id AS internalid, BUILTIN.DF(acctType) AS type, acctNumber AS number, fullname AS name FROM account WHERE isinactive = 'F' ORDER BY internalid`,
      },
      {
        id: "department",
        label: "Departments",
        sql: `SELECT id AS internalid, fullName AS name FROM department WHERE isinactive = 'F' ORDER BY internalid`,
      },
      {
        id: "location",
        label: "Locations",
        sql: `SELECT id AS internalid, fullName AS name FROM location WHERE isinactive = 'F' ORDER BY internalid`,
      },
      {
        id: "class",
        label: "Classes",
        sql: `SELECT id AS internalid, fullName AS name FROM classification WHERE isinactive = 'F' ORDER BY internalid`,
      },
      {
        id: "currency",
        label: "Currencies",
        sql: `SELECT id AS internalid, name FROM currency WHERE isinactive = 'F' ORDER BY internalid`,
      },
    ];

    tables.forEach((tbl) => createSublist(form, tbl.id, tbl.label, tbl.sql));

    scriptContext.response.writePage(form);
  };

  function createSublist(form, sublistId, sublistLabel, sqlQuery) {
    const results = query.runSuiteQL({ query: sqlQuery }).asMappedResults();

    const sublist = form.addSublist({
      id: `custpage_sublist_${sublistId}`,
      label: sublistLabel,
      type: serverWidget.SublistType.LIST,
      tab: "custpage_tab_main",
    });

    if (results.length > 0) {
      const firstRow = results[0];
      Object.keys(firstRow).forEach((key) => {
        sublist.addField({
          id: `custpage_col_${key.toLowerCase()}`,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          type: serverWidget.FieldType.TEXT,
        });
      });

      results.forEach((row, rowIndex) => {
        Object.keys(row).forEach((key) => {
          sublist.setSublistValue({
            id: `custpage_col_${key.toLowerCase()}`,
            line: rowIndex,
            value: row[key] != null ? row[key].toString() : " ",
          });
        });
      });
    }
  }

  return { onRequest };
});
