import { Outlet, useLocation } from "react-router-dom";
import BackButton from "../components/BackButton";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="page-shell min-h-screen">
      <Navbar transparent={isHome} />
      <BackButton />
      <Outlet />
      <Footer />
    </div>
  );
}

export default MainLayout;
