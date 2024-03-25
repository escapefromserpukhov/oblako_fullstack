export const loadingMiddleware = (allActions) => (store) => (next) => (action) => {
  const { dispatch } = store;
  const result = next(action);

  if (action.type.includes("pending")) {
    dispatch(allActions.app.setLoading(true));
  }
  if (action.type.includes("fulfilled")) {
    dispatch(allActions.app.setLoading(false));
  }
  if (action.type.includes("rejected")) {
    dispatch(allActions.app.setLoading(false));
  }

  return result;
};
