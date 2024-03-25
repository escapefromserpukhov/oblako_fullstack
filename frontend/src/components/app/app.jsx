import { useEffect } from "react";
import { useSelector } from "react-redux";
import { CustomProvider, Stack } from "rsuite";

import { useActions } from "../../store";
import { AuthGuard } from "../../guards/auth-guard";
import { Route, Routes, useLocation, Outlet } from "react-router-dom";
import { NotFound } from "../../pages";
import { SignIn, SignUp } from "../../pages/auth";
import { PrivateProtected } from "../private-protected";
import { MainPage } from "../../pages/main";
import { Loading } from "../loading";

export function App() {
  const location = useLocation();
  const { dispatch, actions } = useActions((actions) => actions.user);

  const { loggedIn, data } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(actions.clearRequestErrors());
  }, [location]);

  useEffect(() => {
    !data && dispatch(actions.getMe());
  }, [loggedIn]);

  return (
    <CustomProvider theme="dark">
      <Stack
        justifyContent="center"
        alignItems="center"
        direction="column"
        style={{
          height: "100vh",
          width: "100vw",
        }}
      >
        {/* <AuthGuard /> */}
        <Routes path="/">
          <Route path="/" element={loggedIn ? <Outlet /> : <Loading />}>
            <Route path="/" element={<AuthGuard />}>
              <Route path="/" element={<MainPage />} />
            </Route>
            <Route path="/" element={<PrivateProtected />}>
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Stack>
    </CustomProvider>
  );
}
