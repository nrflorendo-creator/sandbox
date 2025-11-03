/**
 * @NApiVersion 2.1
 */
define(["N/runtime"], /**
 * @param{runtime} runtime
 */ (runtime) => {
  const user = () => {
    const currentUser = runtime.getCurrentUser();

    let isTrue = "";
    // const administrator = 3;
    // const purchasing = 1176;

    // if (currentUser.role == purchasing) {
    //   isTrue = true;
    // } else if (currentUser.role == administrator) {
    //   isTrue = false;
    // }

    const administrator = 3;
    const allowedRoles = [administrator, 1178];

    let isAllowed = allowedRoles.includes(currentUser.role);

    if (isAllowed) {
      isTrue = true;
    } else {
      isTrue = false;
    }

    return isTrue;
  };

  return { user };
});
