import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  Smartphone,
  Laptop,
  Watch,
  Tablet,
  Search
} from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(prev => !prev);

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
          {/* Search and Login (Desktop) */}
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
            <Link
              to="/login"
              className="px-4 py-2 rounded-md text-sm font-medium bg-white text-blue-800 hover:bg-gray-100"
            >
              Login / Register
            </Link>
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
              <Link
                to="/login"
                className="mt-2 block w-full text-center px-4 py-2 rounded-md text-sm font-medium bg-white text-blue-800 hover:bg-gray-100"
              >
                Login / Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
