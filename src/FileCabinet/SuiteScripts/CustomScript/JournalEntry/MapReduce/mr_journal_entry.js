/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(["N/file", "N/record"], (file, record) => {
  /**
   * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
   * @param {Object} inputContext
   * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
   *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
   * @param {Object} inputContext.ObjectRef - Object that references the input data
   * @typedef {Object} ObjectRef
   * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
   * @property {string} ObjectRef.type - Type of the record instance that contains the input data
   * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
   * @since 2015.2
   */

  const getInputData = (inputContext) => {
    const jsonFile = file.load({
      id: 196468,
    });

    const objData = JSON.parse(jsonFile.getContents());

    return objData;
  };

  /**
   * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
   * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
   * context.
   * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
   *     is provided automatically based on the results of the getInputData stage.
   * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
   *     function on the current key-value pair
   * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
   *     pair
   * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
   *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
   * @param {string} mapContext.key - Key to be processed during the map stage
   * @param {string} mapContext.value - Value to be processed during the map stage
   * @since 2015.2
   */

  const map = (mapContext) => {
    const objData = JSON.parse(mapContext.value);

    mapContext.write({
      key: objData.client,
      value: JSON.stringify(objData),
    });
  };

  /**
   * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
   * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
   * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
   *     provided automatically based on the results of the map stage.
   * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
   *     reduce function on the current group
   * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
   * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
   *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
   * @param {string} reduceContext.key - Key to be processed during the reduce stage
   * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
   *     for processing
   * @since 2015.2
   */
  const reduce = (reduceContext) => {
    reduceContext.values.forEach((val) => {
      const objData = JSON.parse(val);

      log.debug("Reduce -> objData", objData);

      try {
        const recJournalEntry = record.create({
          type: record.Type.JOURNAL_ENTRY,
          isDynamic: true,
        });

        setHeaderFields(recJournalEntry, objData);

        objData.line.forEach((line) => {
          recJournalEntry.selectNewLine({ sublistId: "line" });

          recJournalEntry.setCurrentSublistValue({
            sublistId: "line",
            fieldId: "account",
            value: line.account,
          });

          if (line.type === "debit") {
            recJournalEntry.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "debit",
              value: line.debit,
            });
          }

          if (line.type === "credit") {
            recJournalEntry.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "credit",
              value: line.credit,
            });
          }

          recJournalEntry.setCurrentSublistValue({
            sublistId: "line",
            fieldId: "department",
            value: line.department,
          });
          recJournalEntry.setCurrentSublistValue({
            sublistId: "line",
            fieldId: "location",
            value: line.location,
          });

          recJournalEntry.commitLine({ sublistId: "line" });
        });

        const recId = recJournalEntry.save();
        log.audit("Journal Entry Created", recId);
      } catch (e) {
        log.error("Journal Creation Failed", e.message);
      }
    });
  };

  /**
   * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
   * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
   * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
   * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
   *     script
   * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
   * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
   *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
   * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
   * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
   * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
   *     script
   * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
   * @param {Object} summaryContext.inputSummary - Statistics about the input stage
   * @param {Object} summaryContext.mapSummary - Statistics about the map stage
   * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
   * @since 2015.2
   */
  const summarize = (summaryContext) => {
    log.audit("Summary", "Journal Entry Map/Reduce completed.");

    summaryContext.reduceSummary.errors.iterator().each((key, error) => {
      log.error(`Reduce Error for key: ${key}`, error);
      return true;
    });
  };

  function setHeaderFields(recJournalEntry, objData) {
    const headerFieldMap = {
      subsidiary: "subsidiary",
      trandate: "date",
      custbody_externaldocno: "client",
      custbodyemployee_id: "employee",
    };

    Object.keys(headerFieldMap).forEach((fieldId) => {
      let value = objData[headerFieldMap[fieldId]];

      if (fieldId === "trandate") {
        value = new Date(value);
      }

      recJournalEntry.setValue(fieldId, value);
    });
  }

  return { getInputData, map, reduce, summarize };
});
