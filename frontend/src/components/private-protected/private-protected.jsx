import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export const PrivateProtected = () => {
  const { loggedIn } = useSelector((state) => state.user);
  const location = useLocation();

  if (["/signin", "/signup"].includes(location.pathname) && loggedIn) {
    return <Navigate to="/" />;
  }
  return <Outlet />;
};
