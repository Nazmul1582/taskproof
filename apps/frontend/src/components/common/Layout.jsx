import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import NotificationBell from "../notifications/NotificationBell";

const SidebarLink = ({ to, icon: Icon, children, onClick }) => {
  const location = useLocation();
  const isActive =
    location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
        isActive
          ? "bg-primary-50 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      <span className="truncate">{children}</span>
    </Link>
  );
};

const Layout = () => {
  const { user, logout } = useAuthStore();
  const { theme, sidebarOpen, toggleTheme, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024 && !sidebarOpen) {
        toggleSidebar();
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      toggleSidebar();
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/projects", icon: FolderKanban, label: "Projects" },
    { path: "/tasks", icon: CheckSquare, label: "Tasks" },
    { path: "/team", icon: Users, label: "Team" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 sm:w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
            <Link
              to="/dashboard"
              className="text-xl sm:text-2xl font-bold text-primary-600"
            >
              TaskProof
            </Link>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <SidebarLink
                key={item.path}
                to={item.path}
                icon={item.icon}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                {item.label}
              </SidebarLink>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 dark:text-primary-400 font-medium text-sm sm:text-base">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm sm:text-base font-medium truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                    {user?.role?.replace("_", " ")}
                  </p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                />
              </button>

              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`lg:ml-72 transition-all duration-300 ${sidebarOpen ? "ml-0" : "-ml-64 lg:ml-72"}`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="w-10 lg:hidden"></div> {/* Spacer for mobile */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
