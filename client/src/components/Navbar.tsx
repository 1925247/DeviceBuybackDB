import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  Smartphone,
  Laptop,
  Watch,
  Tablet,
  Search,
  User,
  ShoppingCart,
  LogOut,
  Settings,
  Package,
  History
} from 'lucide-react';
import { isAuthenticated, getUserData, useLogout } from '../hooks/use-user';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const logout = useLogout();
  const user = getUserData();
  
  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const toggleProfile = () => setIsProfileOpen(prev => !prev);
  
  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center flex-shrink-0">
              <Smartphone className="h-8 w-8 mr-2" aria-hidden="true" />
              <span className="font-bold text-xl">Cash Old Device</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex space-x-4">
                <Link
                  to="/"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Home
                </Link>
                <div className="relative group">
                  <button
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none"
                  >
                    Sell Devices
                  </button>
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-300 z-50">
                    <div className="py-1">
                      <Link
                        to="/sell/smartphone"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Smartphones
                      </Link>
                      <Link
                        to="/sell/laptop"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Laptops
                      </Link>
                      <Link
                        to="/sell/tablet"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Tablets
                      </Link>
                      <Link
                        to="/sell/smartwatch"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Smartwatches
                      </Link>
                    </div>
                  </div>
                </div>
                <Link
                  to="/about"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Contact
                </Link>
                <Link
                  to="/faq"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  FAQ
                </Link>
                <Link
                  to="/blog"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Blog
                </Link>
              </div>
            </div>
          </div>
          {/* Search and Login/Profile (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
              <input
                type="search"
                placeholder="Search devices..."
                className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md bg-blue-700 text-white placeholder-blue-300 focus:outline-none focus:bg-white focus:text-gray-900 sm:text-sm transition duration-150 ease-in-out"
              />
            </div>
            
            {isAuthenticated() ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={toggleProfile}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md bg-blue-700 hover:bg-blue-600 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {user?.first_name?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                  </div>
                  <span className="text-sm font-medium">{user?.first_name || 'User'}</span>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                    <div className="py-1 rounded-md bg-white shadow-xs">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                        <p className="font-semibold">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="h-4 w-4 mr-2" />
                        My Profile
                      </Link>
                      
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        My Orders
                      </Link>
                      
                      <Link
                        to="/devices"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        My Devices
                      </Link>
                      
                      <Link
                        to="/history"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <History className="h-4 w-4 mr-2" />
                        Purchase History
                      </Link>
                      
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      
                      <button
                        onClick={() => logout.mutate()}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-md text-sm font-medium bg-white text-blue-800 hover:bg-gray-100"
              >
                Login / Register
              </Link>
            )}
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              aria-label="Toggle menu"
              className="p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
            >
              Home
            </Link>
            <div className="space-y-1 pl-4">
              <p className="px-3 py-2 text-base font-medium">Sell Devices:</p>
              <Link
                to="/sell/smartphone"
                className="flex items-center block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              >
                <Smartphone className="h-5 w-5 mr-2" aria-hidden="true" />
                Smartphones
              </Link>
              <Link
                to="/sell/laptop"
                className="flex items-center block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              >
                <Laptop className="h-5 w-5 mr-2" aria-hidden="true" />
                Laptops
              </Link>
              <Link
                to="/sell/tablet"
                className="flex items-center block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              >
                <Tablet className="h-5 w-5 mr-2" aria-hidden="true" />
                Tablets
              </Link>
              <Link
                to="/sell/smartwatch"
                className="flex items-center block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              >
                <Watch className="h-5 w-5 mr-2" aria-hidden="true" />
                Smartwatches
              </Link>
            </div>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
            >
              Contact
            </Link>
            <Link
              to="/faq"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
            >
              FAQ
            </Link>
            <Link
              to="/blog"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
            >
              Blog
            </Link>
            
          </div>
          <div className="pt-4 pb-3 border-t border-blue-700">
            <div className="px-2 space-y-1">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
                <input
                  type="search"
                  placeholder="Search devices..."
                  className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md bg-blue-700 text-white placeholder-blue-300 focus:outline-none focus:bg-white focus:text-gray-900 sm:text-sm transition duration-150 ease-in-out"
                />
              </div>
              
              {isAuthenticated() ? (
                <>
                  <div className="mt-2 px-4 py-2 bg-blue-700 rounded-md">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {user?.first_name?.[0]?.toUpperCase() || <User className="h-6 w-6" />}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs text-blue-200 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    to="/profile"
                    className="flex items-center block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                  >
                    <User className="h-5 w-5 mr-2" aria-hidden="true" />
                    My Profile
                  </Link>
                  
                  <Link
                    to="/orders"
                    className="flex items-center block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" aria-hidden="true" />
                    My Orders
                  </Link>
                  
                  <Link
                    to="/devices"
                    className="flex items-center block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                  >
                    <Package className="h-5 w-5 mr-2" aria-hidden="true" />
                    My Devices
                  </Link>
                  
                  <Link
                    to="/history"
                    className="flex items-center block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                  >
                    <History className="h-5 w-5 mr-2" aria-hidden="true" />
                    Purchase History
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="flex items-center block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                  >
                    <Settings className="h-5 w-5 mr-2" aria-hidden="true" />
                    Settings
                  </Link>
                  
                  <button
                    onClick={() => logout.mutate()}
                    className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                  >
                    <LogOut className="h-5 w-5 mr-2" aria-hidden="true" />
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="mt-2 block w-full text-center px-4 py-2 rounded-md text-sm font-medium bg-white text-blue-800 hover:bg-gray-100"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
