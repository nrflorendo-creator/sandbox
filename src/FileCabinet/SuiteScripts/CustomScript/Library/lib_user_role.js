/**
 * @NApiVersion 2.1
 */
define(["N/runtime"], /**
 * @param{runtime} runtime
 */ (runtime) => {
  const user = () => {
    let isTrue = true;
    const currentUser = runtime.getCurrentUser();

    const administrator = 3;
    const purchasing = 1176;

    if (currentUser.role == purchasing) {
      isTrue = true;
    } else if (currentUser.role == administrator) {
      isTrue = false;
    }

    return isTrue;
  };

  return { user };
});
