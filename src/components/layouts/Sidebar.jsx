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

import AuthService from "../../services/AuthService";
import { useEffect, useState } from "react";

const Sidebar = ({ collapsed }) => {
  const [admin, setAdmin] = useState("hidden");
  const [top, setTop] = useState("hidden");
  const [staffAtasan, setStaffAtasan] = useState("hidden");
  const [staffBawahan, setStaffBawahan] = useState("hidden");

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const checkUser = await AuthService.checkUser();
        if (checkUser.position_type == "ADMIN") {
          setAdmin("show");
        } else if (checkUser.position_type == "ATASAN") {
          setStaffAtasan("show");
        }else if (checkUser.position_type == "BAWAHAN") {
          setStaffBawahan("show");
        }else if (checkUser.position_type == "TOP MANAGEMENT") {
          setTop("show");
        }
      } catch (err) {
        console.error("Failed to fetch supervisors:", err);
        setErrorMessage(err?.message || "Failed to load supervisors");
        setShowErrorModal(true);
      }
    };
    fetchSupervisors();
  }, []);

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
            inner:
              "h-full overflow-y-auto overflow-x-hidden rounded bg-white px-3 py-4 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700",
          },
          item: {
            base: "flex items-center justify-center rounded-lg p-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-all duration-200",
            active:
              "bg-blue-100 text-blue-700 dark:bg-gray-700 dark:text-white font-semibold",
            icon: {
              base: "h-5 w-5 shrink-0 text-gray-500 transition duration-200 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-white",
              active: "text-blue-600 dark:text-white",
            },
          },
          collapse: {
            button:
              "group flex w-full items-center rounded-lg p-3 text-sm font-medium text-gray-700 transition duration-200 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
            icon: {
              base: "h-5 w-5 text-gray-500 transition duration-200 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-white",
            },
          },
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
              to="/penilaian"
              icon={() => <ClipboardCheck size={20} />}
              active={location.pathname.startsWith("/penilaian")}
            >
              Penilaian
            </SidebarItem>
          </SidebarItemGroup>
          <SidebarItemGroup>
            <div className="uppercase text-xs font-bold text-gray-500 dark:text-gray-400 px-3 py-2">
              Master Data
            </div>
            <SidebarItem
              className={admin}
              as={NavLink}
              to="/sub-direktorat"
              icon={() => <Building size={20} />}
              active={location.pathname.startsWith("/sub-direktorat")}
            >
              Subsatker
            </SidebarItem>
            <SidebarItem
              className={admin}
              as={NavLink}
              to="/kompetensi"
              icon={() => <Award size={20} />}
              active={location.pathname.startsWith("/kompetensi")}
            >
              Profil Kompetensi
            </SidebarItem>
            <SidebarItem
              className={admin}
              as={NavLink}
              to="/staff"
              icon={() => <UserCheck size={20} />}
              active={location.pathname.startsWith("/staff")}
            >
              Personel
            </SidebarItem>
            <SidebarItem
              className={top}
              as={NavLink}
              to="/admin"
              icon={() => <UserCheck size={20} />}
              active={location.pathname.startsWith("/admin")}
            >
              Admin
            </SidebarItem>
            <SidebarItem
              as={NavLink}
              to="/Akun"
              icon={() => <UserCheck size={20} />}
              active={location.pathname.startsWith("/Akun")}
            >
              Akun
            </SidebarItem>
            <div className="uppercase text-xs font-bold text-gray-500 dark:text-gray-400 px-3 py-2">
              Laporan
            </div>
            <SidebarItem
              className={staffBawahan}
              as={NavLink}
              to="/laporanIndividu"
              icon={() => <Award size={20} />}
              active={location.pathname.startsWith("/laporanIndividu")}
            >
              Laporan & Hasil
            </SidebarItem>
            <SidebarItem
              className={staffAtasan}
              as={NavLink}
              to="/laporanSubsatker"
              icon={() => <Award size={20} />}
              active={location.pathname.startsWith("/laporanSubsatker")}
            >
              Laporan & Hasil
            </SidebarItem>
            <SidebarItem
              className={admin}
              as={NavLink}
              to="/laporanSubsatkerAdmin"
              icon={() => <Award size={20} />}
              active={location.pathname.startsWith("/laporanSubsatkerAdmin")}
            >
              Laporan & Hasil
            </SidebarItem>
            
          </SidebarItemGroup>
        </SidebarItems>

        {/* DarkThemeToggle moved to Navbar */}
      </FlowbiteSidebar>
    </div>
  );
};

export default Sidebar;
