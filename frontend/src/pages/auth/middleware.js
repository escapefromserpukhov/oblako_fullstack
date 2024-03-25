export const checkValidForm = (allActions) => (store) => (next) => (action) => {
  const { dispatch } = store;
  const result = next(action);
  const state = store.getState().user;
  if ("errors" in state && "hasErrors" in state && "dataFields" in state) {
    const dataFields = {};
    let errors = {};

    switch (location.pathname) {
      case "/signup":
        dataFields.email = state.dataFields.email;
        dataFields.password = state.dataFields.password;
        dataFields.username = state.dataFields.username;
        errors = { ...state.errors };
        break;
      case "/signin":
        dataFields.email = state.dataFields.email;
        dataFields.password = state.dataFields.password;
        errors.email = state.errors.email;
        break;
    }
    const hasEmptyValue = Object.values(dataFields).some((val) => Boolean(val?.toString()) === false);
    const hasErrors = Object.values(errors).join("") !== "" || hasEmptyValue;
    hasErrors !== state.hasErrors && dispatch(allActions.user.setHasErrors(hasErrors));
  }

  return result;
};

export const clearRequestErrors = (allActions) => (store) => (next) => (action) => {
  const { dispatch } = store;
  const result = next(action);
  const state = store.getState().user;

  if (state.requestErrors?.length) {
    if (action.type.includes("pending")) {
      dispatch(allActions.user.clearRequestErrors(true));
    }
  }

  return result;
};
