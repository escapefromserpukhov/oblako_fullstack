import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export const AuthGuard = () => {
  const { loggedIn } = useSelector((state) => state.user);
  const location = useLocation();
  return loggedIn ? (
    <Outlet />
  ) : (
    <Navigate to={["/signin", "/signup"].includes(location.pathname) ? location.pathname : "/signin"} />
  );
};
