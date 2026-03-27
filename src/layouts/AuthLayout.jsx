import { Outlet } from "react-router-dom";
import BackButton from "../components/BackButton";

function AuthLayout() {
  return (
    <>
      <BackButton />
      <Outlet />
    </>
  );
}

export default AuthLayout;
