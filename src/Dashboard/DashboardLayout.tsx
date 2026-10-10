import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { adminLogoutAPI, fetchAdminProfile } from '../redux/slices/adminSlice';
import type { AppDispatch, RootState } from '../redux/store';
import AdminConfirmModal from './Components/AdminConfirmModal';

const navItems = [
  {
    to: '/dashboard',
    label: 'Overview',
    end: true,
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
      </svg>
    ),
  },
  {
    to: '/dashboard/header',
    label: 'Add Header',
    end: false,
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    ),
  },
  {
    to: '/dashboard/home-banner',
    label: 'Home Banner',
    end: false,
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/dashboard/products',
    label: 'Add Product',
    end: false,
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
];

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { admin, isAuthenticated } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('adminToken');
    if (token) {
      localStorage.setItem('adminAccessToken', token);
      dispatch(fetchAdminProfile());
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    const localToken = localStorage.getItem('adminAccessToken');
    if (!isAuthenticated && !localToken) {
      navigate('/dashboard/login');
    } else if (!admin) {
      dispatch(fetchAdminProfile());
    }
  }, [isAuthenticated, admin, navigate, dispatch]);

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(adminLogoutAPI());
      toast.success('Logged out successfully');
      navigate('/dashboard/login');
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans overflow-hidden">
      {/* Sidebar with framer-motion width animation */}
      <motion.aside
        animate={{ width: isSidebarOpen ? 256 : 76 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="bg-[#111827] flex flex-col shadow-2xl relative select-none flex-shrink-0 z-30"
      >
        {/* Circular <> Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3.5 top-6 z-40 w-7 h-7 bg-[#D26900] hover:bg-[#B45309] active:scale-95 text-white rounded-full flex items-center justify-center shadow-md border-2 border-[#111827] transition-all duration-200 cursor-pointer"
          title={isSidebarOpen ? 'Collapse sidebar (<)' : 'Expand sidebar (>)'}
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? (
            // < (collapse)
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            // > (expand)
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>

        {/* Brand / Logo */}
        <div className="h-16 px-4 flex items-center border-b border-white/10 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#D26900] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  <p className="text-white font-bold text-sm leading-tight tracking-wide">YTeddybags</p>
                  <p className="text-[#6B7280] text-[11px] font-medium">Admin Panel</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden sidebar-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={!isSidebarOpen ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#D26900] hover:bg-[#B45309] text-white shadow-lg shadow-[#D26900]/25'
                    : 'text-[#6B7280] hover:bg-white/10 hover:text-white'
                } ${!isSidebarOpen ? 'justify-center px-0' : ''}`
              }
            >
              {item.icon}
              {isSidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section: Profile on Admin Card Click + Logout */}
        <div className="border-t border-white/10 p-2.5 space-y-2">
          {/* Admin Profile Button (Primary when active, Text Secondary when inactive) */}
          <NavLink
            to="/dashboard/profile"
            title="Your Accounts"
            className={({ isActive }) =>
              `group w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#D26900] hover:bg-[#B45309] text-white shadow-lg shadow-[#D26900]/25'
                  : 'hover:bg-white/10 text-[#6B7280] hover:text-white'
              } ${!isSidebarOpen ? 'justify-center p-2' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm transition-colors ${
                    isActive ? 'bg-[#B45309] text-white border border-white/30' : 'bg-[#D26900] text-white'
                  }`}
                >
                  {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
                </div>
                {isSidebarOpen && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className={`text-sm font-medium truncate leading-tight ${
                      isActive ? 'text-white' : 'text-[#6B7280] group-hover:text-white'
                    }`}>
                      Your Accounts
                    </p>
                  </div>
                )}
              </>
            )}
          </NavLink>

          {/* Logout Button */}
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            title={!isSidebarOpen ? 'Logout' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#6B7280] hover:bg-red-500/20 hover:text-red-400 transition-all duration-150 cursor-pointer ${
              !isSidebarOpen ? 'justify-center px-0' : ''
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#F3F4F6] px-6 flex items-center justify-between shadow-xs flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-[#111827] font-bold text-base tracking-tight">Admin Dashboard</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]">
              YTeddybags
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280]">
              <span className="w-2 h-2 bg-[#10B981] rounded-full inline-block animate-pulse" />
              <span>Server Online</span>
            </div>

            {/* Profile Avatar Quick Button */}
            <NavLink
              to="/dashboard/profile"
              title="Your Accounts"
              className="w-8 h-8 rounded-full bg-[#FFF7ED] border border-[#FED7AA] text-[#D26900] flex items-center justify-center font-bold text-xs hover:bg-[#FFEDD5] transition-colors"
            >
              {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
            </NavLink>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F9FAFB]">
          <Outlet />
        </main>
      </div>

      {/* Admin Logout Confirmation Modal */}
      <AdminConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Log Out from Admin?"
        message="Are you sure you want to end your administrative session for YTeddybags?"
        confirmText="Yes, Log Out"
        cancelText="Cancel"
        variant="brand"
        isLoading={isLoggingOut}
      />
    </div>
  );
}
