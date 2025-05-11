// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ModelsProvider } from './contexts/ModelsContext';

// Shared Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Client Pages
import HomePage from './pages/HomePage';
import DeviceSelectionPage from './pages/DeviceSelectionPage';
import ModelSelectionPage from './pages/ModelSelectionPage';
import ConditionAssessmentPage from './pages/ConditionAssessmentPage';
import ValuationPage from './pages/ValuationPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import BlogPage from './pages/BlogPage';
import UserLogin from './pages/UserLogin';

// Buy Flow Pages
import BuyHome from './pages/buy/BuyHome';
import BuyProduct from './pages/buy/BuyProduct';
import BuyCheckout from './pages/buy/BuyCheckout';
import BuyPayment from './pages/buy/BuyPayment';
import BuyInvoice from './pages/buy/BuyInvoice';
import ProductDetails from './pages/buy/ProductDetails';

// Admin Panel Pages

// Legacy Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDevices from './pages/admin/AdminDevices';
import AdminBrands from './pages/admin/AdminBrands';
import AdminModels from './pages/admin/AdminModels';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPricing from './pages/admin/AdminPricing';
import AdminConfig from './pages/admin/AdminConfig';
import AdminCQS from './pages/admin/AdminCQS';
import AdminDiagnostic from './pages/admin/AdminDiagnostic';
import AdminLayout from './components/admin/AdminLayout';

// Not Found Page
import NotFound from './pages/NotFound';

// Local protected route wrapper
const LocalProtectedAdminRoute: React.FC = () => {
  const sessionToken = sessionStorage.getItem('adminToken');
  const persistentToken = localStorage.getItem('adminToken');
  const isAuthenticated = Boolean(sessionToken || persistentToken);

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

const AdminLogout: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    sessionStorage.removeItem('adminData');
    window.location.href = '/admin/login';
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router>
          <div className="flex flex-col min-h-screen">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ModelsProvider>
                        <HomePage />
                      </ModelsProvider>
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/blog"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <BlogPage />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/about"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <AboutPage />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/contact"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ContactPage />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/faq"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <FAQPage />
                    </main>
                    <Footer />
                  </>
                }
              />

              {/* Sell Flow Routes */}
              <Route
                path="/sell/device-selection"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ModelsProvider>
                        <DeviceSelectionPage />
                      </ModelsProvider>
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/sell/:deviceType"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ModelsProvider>
                        <DeviceSelectionPage />
                      </ModelsProvider>
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/sell/:deviceType/:brand"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ModelsProvider>
                        <ModelSelectionPage />
                      </ModelsProvider>
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/sell/:deviceType/:brand/:model/condition"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ModelsProvider>
                        <ConditionAssessmentPage />
                      </ModelsProvider>
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/sell/:deviceType/:brand/:model/valuation"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ModelsProvider>
                        <ValuationPage />
                      </ModelsProvider>
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/checkout"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <CheckoutPage />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/login"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <UserLogin />
                    </main>
                    <Footer />
                  </>
                }
              />

              {/* Buy Flow Routes */}
              <Route
                path="/buy"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ModelsProvider>
                        <BuyHome />
                      </ModelsProvider>
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/buy/products"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ModelsProvider>
                        <BuyProduct />
                      </ModelsProvider>
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/buy/details/:slug"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ModelsProvider>
                        <ProductDetails />
                      </ModelsProvider>
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/buy/checkout"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ModelsProvider>
                        <BuyCheckout />
                      </ModelsProvider>
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/buy/payment"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ModelsProvider>
                        <BuyPayment />
                      </ModelsProvider>
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/buy/invoice"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ModelsProvider>
                        <BuyInvoice />
                      </ModelsProvider>
                    </main>
                    <Footer />
                  </>
                }
              />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route element={<LocalProtectedAdminRoute />}>
                <Route
                  path="/admin/*"
                  element={
                    <ModelsProvider>
                      <AdminLayout />
                    </ModelsProvider>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  
                  {/* Device Management */}
                  <Route path="device-types" element={<AdminCQS />} />
                  <Route path="brands" element={<AdminBrands />} />
                  <Route path="device-models" element={<AdminModels />} />
                  <Route path="devices" element={<AdminDevices />} />
                  
                  {/* Buyback Program */}
                  <Route path="buyback" element={<AdminDashboard />} />
                  <Route path="condition-questions" element={<AdminCQS />} />
                  <Route path="valuations" element={<AdminPricing />} />
                  
                  {/* Marketplace */}
                  <Route path="marketplace" element={<AdminDashboard />} />
                  <Route path="orders" element={<AdminOrders />} />
                  
                  {/* Settings */}
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="faqs" element={<AdminDashboard />} />
                  <Route path="settings" element={<AdminSettings />} />
                  
                  {/* Legacy */}
                  <Route path="config" element={<AdminConfig />} />
                  <Route path="diagnostic" element={<AdminDiagnostic />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Route>

              {/* Catch-all Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
