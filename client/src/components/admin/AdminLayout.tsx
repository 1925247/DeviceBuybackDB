// src/components/admin/AdminLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Smartphone,
  Tag,
  Layers,
  ShoppingCart,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  User,
  Activity,
} from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';

interface MenuItem {
  path: string;
  icon: JSX.Element;
  label: string;
}

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin User');
  const [searchQuery, setSearchQuery] = useState('');

  // Custom hooks for click outside detection
  const userMenuRef = useClickOutside(() => setUserMenuOpen(false));
  const notificationsRef = useClickOutside(() => setNotificationsOpen(false));

  // Menu configuration
  const menuItems: MenuItem[] = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/devices', icon: <Smartphone size={20} />, label: 'Device Types' },
    { path: '/admin/CQS', icon: <Tag size={20} />, label: 'Q&A Management' },
    { path: '/admin/brands', icon: <Tag size={20} />, label: 'Brands' },
    { path: '/admin/models', icon: <Layers size={20} />, label: 'Models' },
    { path: '/admin/diagnostic', icon: <Activity size={20} />, label: 'Diagnostics' },
    { path: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Orders' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Users' },
    { path: '/admin/pricing', icon: <DollarSign size={20} />, label: 'Pricing' },
    { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  useEffect(() => {
    // Load admin data from secure storage
    try {
      const adminData = JSON.parse(
        localStorage.getItem('adminData') ||
        sessionStorage.getItem('adminData') ||
        'null'
      );
      if (adminData?.name) setAdminName(adminData.name);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  }, []);

  const handleLogout = () => {
    // Clear all authentication tokens and data
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    sessionStorage.removeItem('adminData');
    
    navigate('/admin/login');
  };

  const isActive = (path: string): boolean => 
    location.pathname.startsWith(path);

  const notifications = [
    { id: 1, message: 'New order #12345 received', time: '5 minutes ago' },
    { id: 2, message: 'User profile updated', time: '1 hour ago' },
    { id: 3, message: 'System update completed', time: '3 hours ago' },
    { id: 4, message: 'New device model added', time: '1 day ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-gray-800 text-white">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
            <div className="flex items-center">
              <Smartphone className="h-8 w-8 mr-2" aria-hidden="true" />
              <span className="font-bold text-xl">Admin Panel</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-gray-300 hover:text-white"
              aria-label="Close sidebar"
            >
              <X size={24} aria-hidden="true" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto pt-5 pb-4 px-2 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-2 py-2 text-base rounded-md ${
                  isActive(item.path)
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-4">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-2 py-2 text-base rounded-md text-gray-300 hover:bg-gray-700"
              aria-label="Logout"
            >
              <LogOut size={20} className="mr-4" aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gray-800 text-white">
          <div className="flex items-center h-16 px-4 border-b border-gray-700">
            <Smartphone className="h-8 w-8 mr-2" aria-hidden="true" />
            <span className="font-bold text-xl">Admin Panel</span>
          </div>
          <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-2 py-2 text-sm rounded-md ${
                  isActive(item.path)
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-2 py-2 text-sm rounded-md text-gray-300 hover:bg-gray-700"
              aria-label="Logout"
            >
              <LogOut size={20} className="mr-3" aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top Navigation */}
        <div className="sticky top-0 z-10 w-full flex flex-wrap items-center justify-between h-16 bg-white shadow px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 lg:hidden pr-4"
            aria-label="Open menu"
          >
            <Menu size={24} aria-hidden="true" />
          </button>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-lg lg:max-w-xs">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Search"
              />
            </div>
          </div>

          {/* Notifications and User Menu */}
          <div className="ml-4 flex items-center space-x-4">
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1 text-gray-400 hover:text-gray-500"
                aria-label="Notifications"
              >
                <Bell size={20} aria-hidden="true" />
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl">
                  <div className="p-4 border-b">
                    <h3 className="font-medium text-gray-700">Notifications</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 hover:bg-gray-50 border-b last:border-0"
                      >
                        <p className="text-sm text-gray-700">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t">
                    <Link
                      to="/admin/notifications"
                      className="text-blue-600 hover:text-blue-500 text-sm"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2"
                aria-label="User menu"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={16} className="text-gray-600" aria-hidden="true" />
                </div>
                <div className="hidden md:block">
                  <span className="text-gray-700">{adminName}</span>
                  <ChevronDown size={16} className="ml-1 text-gray-400" aria-hidden="true" />
                </div>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl">
                  <Link
                    to="/admin/settings"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Profile Settings
                  </Link>
                  <Link
                    to="/admin/settings"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Account Preferences
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;