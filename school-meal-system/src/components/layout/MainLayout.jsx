import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="drawer lg:drawer-open">
        <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content p-4 lg:p-6">
          <Outlet />
        </div>
        <Sidebar />
      </div>
    </div>
  );
};

export default MainLayout;
