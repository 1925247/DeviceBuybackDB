import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Settings, 
  Users, 
  Package, 
  Smartphone, 
  Tag, 
  HelpCircle,
  BarChart3,
  ShoppingCart,
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    inventory: true,
    qa: true,
    orders: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: Home,
      current: location.pathname === '/admin'
    },
    {
      name: 'Inventory Management',
      icon: Package,
      section: 'inventory',
      children: [
        { name: 'Device Types', href: '/admin/device-types', current: location.pathname === '/admin/device-types' },
        { name: 'Brands', href: '/admin/brands', current: location.pathname === '/admin/brands' },
        { name: 'Models', href: '/admin/models', current: location.pathname === '/admin/models' }
      ]
    },
    {
      name: 'Q&A Management',
      icon: HelpCircle,
      section: 'qa',
      children: [
        { name: 'Condition Questions', href: '/admin/condition-questions', current: location.pathname === '/admin/condition-questions' },
        { name: 'Device Model Questions', href: '/admin/device-model-questions', current: location.pathname === '/admin/device-model-questions' }
      ]
    },
    {
      name: 'Order Management',
      icon: ShoppingCart,
      section: 'orders',
      children: [
        { name: 'Buyback Requests', href: '/admin/buyback', current: location.pathname === '/admin/buyback' },
        { name: 'All Orders', href: '/admin/orders', current: location.pathname === '/admin/orders' }
      ]
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      current: location.pathname === '/admin/users'
    },
    {
      name: 'Lead Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      current: location.pathname === '/admin/analytics'
    },
    {
      name: 'Pricing Manager',
      href: '/admin/pricing-manager',
      icon: Tag,
      current: location.pathname === '/admin/pricing-manager'
    },
    {
      name: 'Question Groups',
      href: '/admin/question-groups',
      icon: HelpCircle,
      current: location.pathname === '/admin/question-groups'
    },
    {
      name: 'Configuration',
      href: '/admin/configuration',
      icon: Settings,
      current: location.pathname === '/admin/configuration'
    }
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <Smartphone className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">Admin Panel</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleSection(item.section)}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                  {expandedSections[item.section] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {expandedSections[item.section] && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.href}
                        className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                          child.current
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white">
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <Smartphone className="h-6 w-6 text-blue-600" />
            <span className="ml-2 font-semibold text-gray-900">Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700"
          >
            <LogOut className="h-6 w-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;