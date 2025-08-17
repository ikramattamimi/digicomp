import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  Avatar,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  DarkThemeToggle,
  Button
} from "flowbite-react";
import {
  Bell,
  Search,
  Settings,
  User,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Menu,
  BookOpen,
  X
} from "lucide-react";

import AuthService from "../../services/AuthService";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TopNavbar = ({ collapsed, setCollapsed, isMobile, showMobileSidebar, setShowMobileSidebar }) => {
  const [account, setAccount] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const checkUser = await AuthService.checkUser();
        setAccount(checkUser);
      } catch (err) {
        console.error("Failed to fetch supervisors:", err);
      }
    };
    fetchSupervisors();
  }, []);

  const handleLogOut = async () => {
    try {
      await AuthService.signUserOut();
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

  const handleSidebarToggle = () => {
    console.log('Toggle clicked:', { isMobile, showMobileSidebar }); // Debug log
    if (isMobile) {
      setShowMobileSidebar(!showMobileSidebar);
    } else {
      setCollapsed(!collapsed);
    }
  };

  // Data dummy untuk user profile
  const userProfile = {
    name: account.name,
    email: account.email,
    role: account.position_type,
    avatar: "https://flowbite.com/docs/images/people/profile-picture-5.jpg",
    department: account.subdirectorat_id,
  };

  return (
    <>
      <Navbar
        fluid
        className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 h-16 fixed top-0 w-full z-50"
      >
        <div className="flex items-center justify-between w-full">
          {/* Left Side - Toggle Button & Brand */}
          <div className="flex items-center">
            {/* Sidebar Toggle Button */}
            <button
              className="p-2 me-2 sm:me-3 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors"
              title={isMobile ? "Toggle menu" : (collapsed ? "Expand sidebar" : "Collapse sidebar")}
              onClick={handleSidebarToggle}
            >
              {isMobile && showMobileSidebar ? (
                <X size={20} className="sm:w-6 sm:h-6" />
              ) : (
                <Menu size={20} className="sm:w-6 sm:h-6" />
              )}
            </button>

            <NavbarBrand href="/" className="flex items-center">
              <span className="self-center whitespace-nowrap text-sm sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                <span className="hidden sm:inline">PROFESI DITPAMOBVIT</span>
                <span className="sm:hidden">PROFESI DITPAMOBVIT</span>
              </span>
            </NavbarBrand>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            {/* Tombol Panduan - Responsive */}
            <Button
              size="sm"
              color="light"
              variant="outline"
              onClick={() => navigate("/panduan")}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 cursor-pointer text-xs sm:text-sm"
              title="Bantuan & Tutorial"
            >
              <BookOpen size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden md:inline">Panduan</span>
              <span className="md:hidden sm:inline hidden">Guide</span>
            </Button>

            {/* Dark Mode Toggle */}
            <div className="hidden sm:block">
              <DarkThemeToggle />
            </div>

            {/* User Profile Dropdown */}
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Avatar 
                  alt="User settings" 
                  img={userProfile.avatar} 
                  rounded 
                  size="sm"
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
              }
              placement="bottom-end"
            >
              <DropdownHeader>
                <span className="block text-sm font-medium text-gray-900 dark:text-white truncate max-w-48">
                  {userProfile.name}
                </span>
                <span className="block truncate text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-48">
                  {userProfile.email}
                </span>
                <span className="block text-xs text-blue-600 dark:text-blue-400 mt-1 truncate max-w-48">
                  {userProfile.role} • {userProfile.department}
                </span>
              </DropdownHeader>
              
              {/* Dark Mode Toggle for Mobile */}
              <div className="sm:hidden px-4 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
                  <DarkThemeToggle />
                </div>
              </div>
              <DropdownDivider className="sm:hidden" />
              
              <DropdownItem icon={User} onClick={() => navigate("/akun")}>
                <span className="text-sm">Akun</span>
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem icon={LogOut} onClick={handleLogOut}>
                <span className="text-sm">Sign out</span>
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </Navbar>

      {/* Mobile Overlay Background - Fixed z-index */}
      {isMobile && showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-[45] lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
          style={{ top: '64px' }} // Start below navbar
        />
      )}
    </>
  );
};

export default TopNavbar;