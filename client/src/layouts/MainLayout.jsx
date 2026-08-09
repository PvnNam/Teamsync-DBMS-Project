import { Outlet } from "react-router-dom";
import SideNav from "../components/SideNav";

function MainLayout() {
  return (
    <>
      <SideNav />
      <div className="main-content">
        <Outlet />
      </div>
    </>
  );
}

export default MainLayout;