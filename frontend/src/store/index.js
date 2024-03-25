import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { appSlice } from "../components/app/reducer";
import { useDispatch } from "react-redux";
import { userSlice } from "../pages/auth";
import { mainSlice } from "../pages/main";
import { storageSlice } from "../pages/storage";
import { checkValidForm } from "../pages/auth/middleware";
import { loadingMiddleware } from "../components/app/middleware";

const slices = {
  appSlice,
  userSlice,
  mainSlice,
  storageSlice,
};

const allActions = {
  app: { ...appSlice.actions },
  user: { ...userSlice.actions },
  main: { ...mainSlice.actions },
  storage: { ...storageSlice.actions },
};

const rootReducer = combineReducers(
  Object.values(slices).reduce((acc, slice) => ({ ...acc, [slice.name]: slice.reducer }), {})
);

const middlewares = [checkValidForm(allActions), loadingMiddleware(allActions)];

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middlewares),
});

export const useActions = (getActions = (actions = allActions) => actions) => {
  const dispatch = useDispatch();
  const actions = getActions(allActions);

  return { dispatch, actions };
};
