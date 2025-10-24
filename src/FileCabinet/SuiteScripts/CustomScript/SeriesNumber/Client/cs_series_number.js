/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(["../Library/lib_series_number.js"], (lib) => {
  const pageInit = (scriptContext) => {
    const currRec = scriptContext.currentRecord;

    lib.fldSetup({
      currRec: currRec,
      mode: scriptContext.mode,
    });
  };

  return { pageInit };
});
