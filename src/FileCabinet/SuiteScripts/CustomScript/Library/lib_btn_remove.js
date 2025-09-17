/**
 * @NApiVersion 2.1
 */
define([], () => {
  const btnEdit = (options) => {
    if (options.inStatus != 2) {
      options.form.removeButton({
        id: "edit",
      });
    }

    if (options.inStatus != 12) {
      options.form.removeButton({
        id: "confirmpayment",
      });
      options.form.removeButton({
        id: "decline",
      });
    }
  };

  return { btnEdit };
});
