import React from "react";
import { useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import {
  Crown,
  Building,
  Award,
  Target,
  Users,
  UserCheck,
  UserMinus,
  ClipboardCheck,
  Menu,
  ChevronLeft,
  Home,
} from "lucide-react";
import {
  Sidebar as FlowbiteSidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
  SidebarLogo,
  SidebarCollapse,
  DarkThemeToggle,
} from "flowbite-react";

const Sidebar = ({ collapsed }) => {
  const location = useLocation();
  if (collapsed) {
    return (
      <div className="h-full bg-transparent flex items-start justify-center pt-4">
        {/* Toggle sidebar button moved to Navbar */}
      </div>
    );
  }

  return (
    <div className="h-full w-[250px] relative">
      <FlowbiteSidebar 
        aria-label="Admin sidebar" 
        className="h-full border-t-0"
        theme={{
          root: {
            inner: "h-full overflow-y-auto overflow-x-hidden rounded bg-white px-3 py-4 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
          },
          item: {
            base: "flex items-center justify-center rounded-lg p-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-all duration-200",
            active: "bg-blue-100 text-blue-700 dark:bg-gray-700 dark:text-white font-semibold",
            icon: {
              base: "h-5 w-5 shrink-0 text-gray-500 transition duration-200 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-white",
              active: "text-blue-600 dark:text-white"
            }
          },
          collapse: {
            button: "group flex w-full items-center rounded-lg p-3 text-sm font-medium text-gray-700 transition duration-200 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
            icon: {
              base: "h-5 w-5 text-gray-500 transition duration-200 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-white"
            }
          }
        }}
      >
        {/* Toggle sidebar button moved to Navbar */}

        <SidebarItems>
          <SidebarItemGroup>
          <SidebarItem
            as={NavLink}
            to="/"
            icon={() => <Home size={20} />}
            active={location.pathname === "/"}
          >
            Dashboard
          </SidebarItem>
          </SidebarItemGroup>
          <SidebarItemGroup>
            <div className="uppercase text-xs font-bold text-gray-500 dark:text-gray-400 px-3 py-2">
              Main Menu
            </div>
            <SidebarItem
              as={NavLink}
              to="/assessments"
              icon={() => <ClipboardCheck size={20} />}
              active={location.pathname.startsWith("/assessments")}
            >
              Penilaian
            </SidebarItem>
          </SidebarItemGroup>
          <SidebarItemGroup>
            <div className="uppercase text-xs font-bold text-gray-500 dark:text-gray-400 px-3 py-2">
              Master Data
            </div>
            <SidebarItem
              as={NavLink}
              to="/sub-direktorat"
              icon={() => <Building size={20} />}
              active={location.pathname.startsWith("/sub-direktorat")}
            >
              Sub Direktorat
            </SidebarItem>
            <SidebarItem
              as={NavLink}
              to="/kompetensi"
              icon={() => <Award size={20} />}
              active={location.pathname.startsWith("/kompetensi")}
            >
              Kompetensi
            </SidebarItem>
            <SidebarItem
              as={NavLink}
              to="/indikator"
              icon={() => <Target size={20} />}
              active={location.pathname.startsWith("/indikator")}
            >
              Indikator
            </SidebarItem>
            <SidebarItem
              as={NavLink}
              to="/staff"
              icon={() => <UserCheck size={20} />}
              active={location.pathname.startsWith("/staff")}
            >
              Staff
            </SidebarItem>
          </SidebarItemGroup>
        </SidebarItems>

        {/* DarkThemeToggle moved to Navbar */}
      </FlowbiteSidebar>
    </div>
  );
};

export default Sidebar;
