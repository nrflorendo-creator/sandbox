/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(["N/query"], (query) => {
  /**
   * Function to be executed after page is initialized.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
   *
   * @since 2015.2
   */
  const pageInit = (scriptContext) => {};

  /**
   * Function to be executed when field is changed.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   * @param {string} scriptContext.fieldId - Field name
   * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
   * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
   *
   * @since 2015.2
   */
  const fieldChanged = (scriptContext) => {};

  /**
   * Function to be executed when field is slaved.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   * @param {string} scriptContext.fieldId - Field name
   *
   * @since 2015.2
   */
  const postSourcing = (scriptContext) => {};

  /**
   * Function to be executed after sublist is inserted, removed, or edited.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @since 2015.2
   */
  const sublistChanged = (scriptContext) => {};

  /**
   * Function to be executed after line is selected.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @since 2015.2
   */
  const lineInit = (scriptContext) => {};

  /**
   * Validation function to be executed when field is changed.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   * @param {string} scriptContext.fieldId - Field name
   * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
   * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
   *
   * @returns {boolean} Return true if field is valid
   *
   * @since 2015.2
   */
  const validateField = (scriptContext) => {};

  /**
   * Validation function to be executed when sublist line is committed.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @returns {boolean} Return true if sublist line is valid
   *
   * @since 2015.2
   */
  const validateLine = (scriptContext) => {};

  /**
   * Validation function to be executed when sublist line is inserted.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @returns {boolean} Return true if sublist line is valid
   *
   * @since 2015.2
   */
  const validateInsert = (scriptContext) => {};

  /**
   * Validation function to be executed when record is deleted.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @returns {boolean} Return true if sublist line is valid
   *
   * @since 2015.2
   */
  const validateDelete = (scriptContext) => {};

  /**
   * Validation function to be executed when record is saved.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @returns {boolean} Return true if record is valid
   *
   * @since 2015.2
   */
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
          const stMessage = `The combination of Bank: "${objData.bank}", Payment Method: "${objData.method}", and User: "${objData.user}" is already in use.\n\nWould you like to open the existing record?`;

          if (confirm(stMessage)) {
            const baseUrl = window.location.origin; // dynamically gets sandbox or prod
            window.open(
              `${baseUrl}/app/common/custom/custrecordentry.nl?rectype=${inType}&id=${objData.id}`,
              "_blank"
            );
          }

          blSave = false;
        }
      }
    }

    return blSave;
  };

  return {
    saveRecord,
  };
});
