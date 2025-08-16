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
} from "lucide-react";

import AuthService from "../../services/AuthService";
import { useEffect, useState } from "react";

const TopNavbar = ({ collapsed, setCollapsed }) => {
  const [account, setAccount] = useState([]);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const checkUser = await AuthService.checkUser();
        setAccount(checkUser);
      } catch (err) {
        console.error("Failed to fetch supervisors:", err);
        setErrorMessage(err?.message || "Failed to load supervisors");
        setShowErrorModal(true);
      }
    };
    fetchSupervisors();
  }, []);

  const handleLogOut = async () => {
    try {
      await AuthService.signUserOut();
    } catch (err) {
      setModalError(err?.message || "Failed to save supervisor");
      setShowModal(true);
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
    <Navbar
      fluid
      className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4"
    >
      <div className="flex items-center justify-between">
        {/* Sidebar Toggle Button */}
        <button
          className="p-2 me-3 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu size={24} />
        </button>

        <NavbarBrand href="/">
          <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-900 dark:text-white">
            PROFESI DITPAMOBVIT
          </span>
        </NavbarBrand>
      </div>
      <div className="flex items-center gap-3 md:order-2">
        {/* Dark Mode Toggle */}
        <DarkThemeToggle />

        {/* Search Button */}
        <button
          className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors"
          title="Search"
        >
          <Search size={20} />
        </button>

        {/* Notifications */}
        <button
          className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 relative transition-colors"
          title="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Profile Dropdown */}
        <Dropdown
          arrowIcon={false}
          inline
          label={
            <Avatar alt="User settings" img={userProfile.avatar} rounded />
          }
        >
          <DropdownHeader>
            <span className="block text-sm font-medium text-gray-900 dark:text-white">
              {userProfile.name}
            </span>
            <span className="block truncate text-sm text-gray-500 dark:text-gray-400">
              {userProfile.email}
            </span>
            <span className="block text-xs text-blue-600 dark:text-blue-400 mt-1">
              {userProfile.role} • {userProfile.department}
            </span>
          </DropdownHeader>
          <DropdownItem icon={User}>Profile</DropdownItem>
          <DropdownItem icon={Settings}>Settings</DropdownItem>
          <DropdownItem icon={HelpCircle}>Help Center</DropdownItem>
          <DropdownDivider />
          <DropdownItem icon={LogOut} onClick={handleLogOut}>
            Sign out
          </DropdownItem>
        </Dropdown>
      </div>

      {/* <NavbarCollapse>
        <NavbarLink href="/" active>
          Dashboard
        </NavbarLink>
        <NavbarLink href="/reports">
          Reports
        </NavbarLink>
        <NavbarLink href="/analytics">
          Analytics
        </NavbarLink>
        <NavbarLink href="/help">
          Help
        </NavbarLink>
      </NavbarCollapse> */}
    </Navbar>
  );
};

export default TopNavbar;
