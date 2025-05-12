import React from 'react';
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
  Headphones
} from "lucide-react";

const AdminLayout: React.FC = () => {
  const location = useLocation();

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
      {/* Sidebar - always visible */}
      <div className="w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold text-gray-800">
              Admin Panel
            </h1>
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
                  <Headphones className="w-5 h-5 mr-3" />
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
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;