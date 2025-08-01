import React, { useState } from 'react';
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import TopNavbar from "./Navbar.jsx";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(true);

  const handleCollapse = (value) => setCollapsed(value);

  return (
    <div className="transition-colors duration-300">
      {/* Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <TopNavbar collapsed={collapsed} setCollapsed={handleCollapse} />
      </div>
      
      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] z-20 transition-all duration-300 `}
      >
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Main Content */}
      <div className="flex pt-16">
        <div className={collapsed ? '' : 'w-[250px]'}></div>
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;