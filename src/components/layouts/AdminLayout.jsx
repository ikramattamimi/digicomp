import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import TopNavbar from "./Navbar.jsx";
import LoadingSpinner from "../common/LoadingSpinner.jsx";

import AuthService from "../../services/AuthService";
import { useUserContext } from "../../contexts/UserContext.js";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(() => {
    // Initialize from localStorage for persistence
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Mobile sidebar states
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const user = useUserContext();
  const navigate = useNavigate();

  // Check screen size for mobile detection
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      
      // Close mobile sidebar when switching to desktop
      if (!mobile) {
        setShowMobileSidebar(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile) {
      setShowMobileSidebar(false);
    }
  }, [navigate, isMobile]);

  // Memoize the collapse handler to prevent unnecessary re-renders
  const handleCollapse = useCallback((value) => {
    setCollapsed(value);
    // Persist sidebar state
    localStorage.setItem('sidebar-collapsed', JSON.stringify(value));
  }, []);

  // Memoize layout classes for performance
  const layoutClasses = useMemo(() => ({
    container: "min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300",
    navbar: "fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
    sidebar: isMobile 
      ? `fixed top-16 left-0 h-[calc(100vh-4rem)] z-30 transition-transform duration-300 w-64 ${
          showMobileSidebar ? "translate-x-0" : "-translate-x-full"
        }`
      : `fixed top-16 left-0 h-[calc(100vh-4rem)] z-20 transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`,
    content: "flex pt-16 min-h-screen",
    contentSpacer: isMobile ? "" : (collapsed ? "w-16" : "w-64"),
    mainContent: isMobile 
      ? "flex-1 w-full min-w-0 p-4 sm:p-6 overflow-x-hidden"
      : "flex-1 min-w-0 p-6 overflow-x-hidden"
  }), [collapsed, isMobile, showMobileSidebar]);

  // Enhanced authentication check with better error handling
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!user) {
          // Add a small delay to prevent flash
          await new Promise(resolve => setTimeout(resolve, 100));
          navigate("/login", { replace: true });
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Authentication check failed:", error);
        navigate("/login", { replace: true });
      }
    };

    checkAuth();
  }, [user, navigate]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className={layoutClasses.container}>
      {/* Top Navbar */}
      <div className={layoutClasses.navbar}>
        <TopNavbar 
          collapsed={collapsed} 
          setCollapsed={handleCollapse}
          isMobile={isMobile}
          showMobileSidebar={showMobileSidebar}
          setShowMobileSidebar={setShowMobileSidebar}
        />
      </div>

      {/* Sidebar */}
      <div className={layoutClasses.sidebar}>
        <Sidebar 
          collapsed={collapsed} 
          isMobile={isMobile}
          showMobileSidebar={showMobileSidebar}
          setShowMobileSidebar={setShowMobileSidebar}
        />
      </div>

      {/* Main Content */}
      <div className={layoutClasses.content}>
        {/* Spacer for sidebar - only on desktop */}
        {!isMobile && (
          <div className={layoutClasses.contentSpacer} aria-hidden="true" />
        )}
        
        {/* Main content area */}
        <main className={layoutClasses.mainContent} role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;