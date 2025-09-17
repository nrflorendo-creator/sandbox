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

    const inRequestor = currRec.getValue({
      fieldId: "entity",
    });

    currRec.setValue({
      fieldId: "custbodyemployee_id",
      value: inRequestor,
    });
  };

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
  const fieldChanged = (scriptContext) => {
    const currRec = scriptContext.currentRecord;

    if (scriptContext.fieldId === "entity") {
      const inRequestor = currRec.getValue({
        fieldId: "entity",
      });

      currRec.setValue({
        fieldId: "custbodyemployee_id",
        value: inRequestor,
      });
    }

    if (scriptContext.fieldId === "estimatedrate") {
      const inDepartment = currRec.getValue({
        fieldId: "department",
      });
      const inLocation = currRec.getValue({
        fieldId: "location",
      });
      console.log("fieldChanged: ", inDepartment + " ---- " + inLocation);

      currRec.setCurrentSublistValue({
        sublistId: "item",
        fieldId: "department",
        value: inDepartment,
      });
      currRec.setCurrentSublistValue({
        sublistId: "item",
        fieldId: "location",
        value: inLocation,
      });

      const objSublist = currRec.getSublist({
        sublistId: "item",
      });
      const objDepartment = objSublist.getColumn({
        fieldId: "department",
      });
      objDepartment.isDisabled = true;

      const objLocation = objSublist.getColumn({
        fieldId: "location",
      });
      objLocation.isDisabled = true;
    }
  };

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
  const saveRecord = (scriptContext) => {};

  return {
    pageInit,
    fieldChanged,
    // postSourcing,
    // sublistChanged,
    // lineInit,
    // validateField,
    // validateLine,
    // validateInsert,
    // validateDelete,
    // saveRecord
  };
});
