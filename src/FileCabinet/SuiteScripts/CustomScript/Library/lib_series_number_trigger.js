/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define([], () => {
  /**
   * Function to be executed after page is initialized.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
   *
   * @since 2015.2
   */
  const pageInit = (scriptContext) => {
    const currRec = scriptContext.currentRecord;

    ["autoname", "entityid"].forEach((fieldId) => {
      currRec.setValue({ fieldId, value: fieldId === "entityid" ? 0 : false });
      currRec.getField({ fieldId }).isDisabled = true;
    });
  };

  return { pageInit };
});
