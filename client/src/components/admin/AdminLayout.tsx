import React, { useState, ReactNode } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Smartphone, 
  Tag as TagIcon, 
  Box as BoxIcon, 
  ShoppingBag, 
  Settings, 
  CheckCircle, 
  ListChecks,
  MonitorSmartphone,
  Layers,
  Briefcase,
  HelpCircle,
  ChevronRight
} from "lucide-react";

interface AdminLayoutProps {
  logout?: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ logout }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    const currentPath = location.pathname;
    if (path === '/admin' && currentPath === '/admin') {
      return true;
    }
    return path !== '/admin' && currentPath.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 ease-in-out hidden md:block`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className={`text-xl font-bold text-gray-800 ${!isSidebarOpen && 'hidden'}`}>
              Admin Panel
            </h1>
            <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
              {isSidebarOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-3 mb-4">
              <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Dashboard
              </h3>
              <nav className="mt-2 space-y-1">
                <Link
                  to="/admin"
                  className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive('/admin')
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="w-5 h-5 mr-3" />
                  {isSidebarOpen && <span>Overview</span>}
                </Link>

                <Link
                  to="/admin/users"
                  className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive('/admin/users')
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-5 h-5 mr-3" />
                  {isSidebarOpen && <span>Users</span>}
                </Link>
              </nav>
            </div>

            <div className="px-3 mb-4">
              <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Device Management
              </h3>
              <nav className="mt-2 space-y-1">
                <Link
                  to="/admin/device-types"
                  className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive('/admin/device-types')
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mr-3" />
                  {isSidebarOpen && <span>Device Types</span>}
                </Link>

                <Link
                  to="/admin/brands"
                  className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive('/admin/brands')
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <TagIcon className="w-5 h-5 mr-3" />
                  {isSidebarOpen && <span>Brands</span>}
                </Link>

                <Link
                  to="/admin/device-models"
                  className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive('/admin/device-models')
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <MonitorSmartphone className="w-5 h-5 mr-3" />
                  {isSidebarOpen && <span>Device Models</span>}
                </Link>

                <Link
                  to="/admin/devices"
                  className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive('/admin/devices')
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Layers className="w-5 h-5 mr-3" />
                  {isSidebarOpen && <span>Device Inventory</span>}
                </Link>
              </nav>
            </div>

            <div className="px-3 mb-4">
              <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Buyback Program
              </h3>
              <nav className="mt-2 space-y-1">
                <Link
                  to="/admin/buyback"
                  className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive('/admin/buyback')
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BoxIcon className="w-5 h-5 mr-3" />
                  {isSidebarOpen && <span>Buyback Requests</span>}
                </Link>

                <Link
                  to="/admin/condition-questions"
                  className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive('/admin/condition-questions')
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <CheckCircle className="w-5 h-5 mr-3" />
                  {isSidebarOpen && <span>Condition Questions</span>}
                </Link>

                <Link
                  to="/admin/valuations"
                  className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive('/admin/valuations')
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Briefcase className="w-5 h-5 mr-3" />
                  {isSidebarOpen && <span>Valuations</span>}
                </Link>
              </nav>
            </div>

            <div className="px-3 mb-4">
              <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Marketplace
              </h3>
              <nav className="mt-2 space-y-1">
                <Link
                  to="/admin/marketplace"
                  className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive('/admin/marketplace')
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5 mr-3" />
                  {isSidebarOpen && <span>Listings</span>}
                </Link>

                <Link
                  to="/admin/orders"
                  className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive('/admin/orders')
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ListChecks className="w-5 h-5 mr-3" />
                  {isSidebarOpen && <span>Orders</span>}
                </Link>
              </nav>
            </div>

            <div className="px-3">
              <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Settings
              </h3>
              <nav className="mt-2 space-y-1">
                <Link
                  to="/admin/faqs"
                  className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive('/admin/faqs')
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <HelpCircle className="w-5 h-5 mr-3" />
                  {isSidebarOpen && <span>FAQs</span>}
                </Link>

                <Link
                  to="/admin/settings"
                  className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive('/admin/settings')
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  {isSidebarOpen && <span>Settings</span>}
                </Link>
              </nav>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            {isSidebarOpen ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">A</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Admin User</p>
                    <p className="text-xs text-gray-500">admin@example.com</p>
                  </div>
                </div>
                {logout && <div>{logout}</div>}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                  <span className="text-sm font-medium text-gray-700">A</span>
                </div>
                {logout && <div>{logout}</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className="md:hidden">
        <div
          className={`fixed inset-0 z-40 ${isSidebarOpen ? 'block' : 'hidden'}`}
          onClick={toggleSidebar}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>

        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
              <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-3 mb-4">
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Dashboard
                </h3>
                <nav className="mt-2 space-y-1">
                  <Link
                    to="/admin"
                    onClick={toggleSidebar}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="w-5 h-5 mr-3" />
                    <span>Overview</span>
                  </Link>
                  
                  <Link
                    to="/admin/users"
                    onClick={toggleSidebar}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/users')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Users className="w-5 h-5 mr-3" />
                    <span>Users</span>
                  </Link>
                </nav>
              </div>
              
              <div className="px-3 mb-4">
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Device Management
                </h3>
                <nav className="mt-2 space-y-1">
                  <Link
                    to="/admin/device-types"
                    onClick={toggleSidebar}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/device-types')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 mr-3" />
                    <span>Device Types</span>
                  </Link>
                  
                  <Link
                    to="/admin/brands"
                    onClick={toggleSidebar}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/brands')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <TagIcon className="w-5 h-5 mr-3" />
                    <span>Brands</span>
                  </Link>
                  
                  <Link
                    to="/admin/device-models"
                    onClick={toggleSidebar}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/device-models')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <MonitorSmartphone className="w-5 h-5 mr-3" />
                    <span>Device Models</span>
                  </Link>
                  
                  <Link
                    to="/admin/devices"
                    onClick={toggleSidebar}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/devices')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Layers className="w-5 h-5 mr-3" />
                    <span>Device Inventory</span>
                  </Link>
                </nav>
              </div>
              
              <div className="px-3 mb-4">
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Buyback Program
                </h3>
                <nav className="mt-2 space-y-1">
                  <Link
                    to="/admin/buyback"
                    onClick={toggleSidebar}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/buyback')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BoxIcon className="w-5 h-5 mr-3" />
                    <span>Buyback Requests</span>
                  </Link>
                  
                  <Link
                    to="/admin/condition-questions"
                    onClick={toggleSidebar}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/condition-questions')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span>Condition Questions</span>
                  </Link>
                  
                  <Link
                    to="/admin/valuations"
                    onClick={toggleSidebar}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/valuations')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Briefcase className="w-5 h-5 mr-3" />
                    <span>Valuations</span>
                  </Link>
                </nav>
              </div>
              
              <div className="px-3 mb-4">
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Marketplace
                </h3>
                <nav className="mt-2 space-y-1">
                  <Link
                    to="/admin/marketplace"
                    onClick={toggleSidebar}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/marketplace')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5 mr-3" />
                    <span>Listings</span>
                  </Link>
                  
                  <Link
                    to="/admin/orders"
                    onClick={toggleSidebar}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/orders')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ListChecks className="w-5 h-5 mr-3" />
                    <span>Orders</span>
                  </Link>
                </nav>
              </div>
              
              <div className="px-3">
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Settings
                </h3>
                <nav className="mt-2 space-y-1">
                  <Link
                    to="/admin/faqs"
                    onClick={toggleSidebar}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/faqs')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <HelpCircle className="w-5 h-5 mr-3" />
                    <span>FAQs</span>
                  </Link>
                  
                  <Link
                    to="/admin/settings"
                    onClick={toggleSidebar}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/settings')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    <span>Settings</span>
                  </Link>
                </nav>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">A</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Admin User</p>
                    <p className="text-xs text-gray-500">admin@example.com</p>
                  </div>
                </div>
                {logout && <div>{logout}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow md:hidden">
          <div className="px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;