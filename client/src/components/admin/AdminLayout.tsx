import React, { useState, useEffect } from 'react';
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
  PackageOpen,
  Truck,
  CreditCard,
  DollarSign,
  Percent,
  Mail,
  Globe,
  PanelLeft,
  RefreshCw,
  Headphones,
  Map,
  Building,
  Handshake,
  MapPin,
  ClipboardList,
  FileQuestion,
  Menu,
  X,
  Bell,
  User,
  Search,
  ChevronDown
} from "lucide-react";

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminName, setAdminName] = useState('Admin User');

  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    const currentPath = location.pathname;
    if (path === '/admin' && currentPath === '/admin') {
      return true;
    }
    return path !== '/admin' && currentPath.startsWith(path);
  };

  // Close the sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close sidebar on navigation on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top navbar - always visible */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              className="p-2 rounded-md lg:hidden text-gray-700 hover:bg-gray-100"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl font-bold text-gray-800 ml-2 lg:ml-0">
              Admin Panel
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Mobile search button */}
            <button 
              className="p-2 rounded-md md:hidden text-gray-700 hover:bg-gray-100"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} />
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-md text-gray-700 hover:bg-gray-100 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
            </button>

            {/* User menu */}
            <div className="relative">
              <button 
                className="flex items-center gap-2 p-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  {adminName.charAt(0)}
                </div>
                <span className="hidden md:block">{adminName}</span>
                <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link 
                    to="/admin/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/admin/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      // Handle logout
                      localStorage.removeItem('adminToken');
                      sessionStorage.removeItem('adminToken');
                      window.location.href = '/admin/login';
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search - displayed when open */}
        {isSearchOpen && (
          <div className="p-2 bg-white border-t border-gray-100 md:hidden">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed inset-y-0 top-[57px] left-0 z-20 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:h-auto`}
        >
          <div className="flex flex-col h-full">
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
                    <span>Overview</span>
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
                    to="/admin/categories"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/categories')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Layers className="w-5 h-5 mr-3" />
                    <span>Categories</span>
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
                    <span>Brands</span>
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
                    <span>Device Models</span>
                  </Link>

                  <Link
                    to="/admin/revolutionary"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/revolutionary')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <RefreshCw className="w-5 h-5 mr-3" />
                    <span>Add Revolutionary</span>
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
                    <span>Device Inventory</span>
                  </Link>
                </nav>
              </div>

              <div className="px-3 mb-4">
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Regions & Partners
                </h3>
                <nav className="mt-2 space-y-1">
                  <Link
                    to="/admin/regions"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/regions')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Map className="w-5 h-5 mr-3" />
                    <span>Region Management</span>
                  </Link>

                  <Link
                    to="/admin/partners"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/partners')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Building className="w-5 h-5 mr-3" />
                    <span>Partner Management</span>
                  </Link>

                  <Link
                    to="/admin/partner-staff"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/partner-staff')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Users className="w-5 h-5 mr-3" />
                    <span>Partner Staff</span>
                  </Link>

                  <Link
                    to="/admin/pin-codes"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/pin-codes')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <MapPin className="w-5 h-5 mr-3" />
                    <span>PIN Code Assignment</span>
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
                    <span>Buyback Requests</span>
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
                    <span>Condition Questions</span>
                  </Link>

                  <Link
                    to="/admin/brand-questionnaires"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/brand-questionnaires')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FileQuestion className="w-5 h-5 mr-3" />
                    <span>Brand Questionnaires</span>
                  </Link>

                  <Link
                    to="/admin/price-conditions"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/price-conditions')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <DollarSign className="w-5 h-5 mr-3" />
                    <span>Price Conditions</span>
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
                    <span>Valuations</span>
                  </Link>
                  
                  <Link
                    to="/admin/partner-program"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/partner-program')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Handshake className="w-5 h-5 mr-3" />
                    <span>Partner Program</span>
                  </Link>
                </nav>
              </div>

              <div className="px-3 mb-4">
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  E-Commerce
                </h3>
                <nav className="mt-2 space-y-1">
                  <Link
                    to="/admin/products"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/products')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5 mr-3" />
                    <span>Products</span>
                  </Link>

                  <Link
                    to="/admin/product-categories"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/product-categories')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <TagIcon className="w-5 h-5 mr-3" />
                    <span>Product Categories</span>
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
                    <span>Orders</span>
                  </Link>

                  <Link
                    to="/admin/inventory"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/inventory')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <PackageOpen className="w-5 h-5 mr-3" />
                    <span>Inventory</span>
                  </Link>

                  <Link
                    to="/admin/shipping"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/shipping')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Truck className="w-5 h-5 mr-3" />
                    <span>Shipping</span>
                  </Link>

                  <Link
                    to="/admin/payments"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/payments')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mr-3" />
                    <span>Payments</span>
                  </Link>

                  <Link
                    to="/admin/discounts"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/discounts')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Percent className="w-5 h-5 mr-3" />
                    <span>Discounts</span>
                  </Link>

                  <Link
                    to="/admin/marketplace"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/marketplace')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Globe className="w-5 h-5 mr-3" />
                    <span>Marketplace</span>
                  </Link>

                  <Link
                    to="/admin/analytics"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/analytics')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <PanelLeft className="w-5 h-5 mr-3" />
                    <span>Analytics</span>
                  </Link>
                </nav>
              </div>

              <div className="px-3 mb-4">
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Templates & Customization
                </h3>
                <nav className="mt-2 space-y-1">
                  <Link
                    to="/admin/store-templates"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/store-templates')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5 mr-3" />
                    <span>Store Templates</span>
                  </Link>

                  <Link
                    to="/admin/store-themes"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/store-themes')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <PanelLeft className="w-5 h-5 mr-3" />
                    <span>Store Themes</span>
                  </Link>

                  <Link
                    to="/admin/invoice-templates"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/invoice-templates')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ClipboardList className="w-5 h-5 mr-3" />
                    <span>Invoice Templates</span>
                  </Link>
                </nav>
              </div>

              <div className="px-3 mb-4">
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Settings
                </h3>
                <nav className="mt-2 space-y-1">
                  <Link
                    to="/admin/marketplace-settings"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/marketplace-settings')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5 mr-3" />
                    <span>Marketplace Settings</span>
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
                    <span>General Settings</span>
                  </Link>
                  
                  <Link
                    to="/admin/user-roles"
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/admin/user-roles')
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Users className="w-5 h-5 mr-3" />
                    <span>User Roles</span>
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Overlay for mobile when sidebar is open */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;