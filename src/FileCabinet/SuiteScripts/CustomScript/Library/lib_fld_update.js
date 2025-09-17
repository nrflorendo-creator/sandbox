/**
 * @NApiVersion 2.1
 */
define(["N/record"], (record) => {
  const customRelatedRecord = (options) => {
    const inCreatedFrom = options.newRec.getValue({
      fieldId: "createdfrom",
    });

    record.submitFields({
      type: record.Type.INVOICE,
      id: inCreatedFrom,
      values: {
        custbody_pdi_related_record: options.newRec.id,
      },
    });
  };

  return { customRelatedRecord };
});
