// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ModelsProvider } from "./contexts/ModelsContext";

// Shared Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Client Pages
import HomePage from "./pages/HomePage";
import DeviceSelectionPage from "./pages/DeviceSelectionPage";
import DeviceSelection from "./pages/sell/DeviceSelection";
import ModelSelectionPage from "./pages/ModelSelectionPage";
import ConditionAssessmentPage from "./pages/ConditionAssessmentPage";
import ValuationPage from "./pages/ValuationPage";
import CheckoutPage from "./pages/CheckoutPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import BlogPage from "./pages/BlogPage";
import UserLogin from "./pages/UserLogin";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";

// Shop Flow Pages
import BuyHome from "./pages/Shop/BuyHome";
import BuyProduct from "./pages/Shop/BuyProduct";

import BuyCheckout from "./pages/Shop/BuyCheckout";
import BuyPayment from "./pages/Shop/BuyPayment";
import BuyInvoice from "./pages/Shop/BuyInvoice";
import ProductDetails from "./pages/Shop/ProductDetails";

// Alias BuyHome as ShopPage
const ShopPage = BuyHome;

// Admin Panel Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDevices from "./pages/admin/AdminDevices";
import AdminDeviceTypes from "./pages/admin/AdminDeviceTypes";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminModels from "./pages/admin/AdminModels";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminConfig from "./pages/admin/AdminConfig";
import AdminCQS from "./pages/admin/AdminCQS";
import AdminDiagnostic from "./pages/admin/AdminDiagnostic";
import AdminBuybacks from "./pages/admin/AdminBuybacks";
import AdminBuybacksNew from "./pages/admin/AdminBuybacksNew";
import ConditionQuestionsAdmin from "./pages/admin/ConditionQuestionsAdmin";
import RegionsManagement from "./pages/admin/RegionsManagement";
import UserRoleManagement from "./pages/admin/UserRoleManagement";
import RouteManagement from "./pages/admin/RouteManagement";
import ManageRouteRules from "./pages/admin/ManageRouteRules";
import PartnersManagement from "./pages/admin/PartnersManagement";
import AdminLayout from "./components/admin/AdminLayout";

// E-commerce Admin Pages
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminMarketplaceSettings from "./pages/admin/AdminMarketplaceSettings";

// Not Found Page
import NotFound from "./pages/NotFound";

// Local protected route wrapper
const LocalProtectedAdminRoute: React.FC = () => {
  const sessionToken = sessionStorage.getItem("adminToken");
  const persistentToken = localStorage.getItem("adminToken");
  const isAuthenticated = Boolean(sessionToken || persistentToken);

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

const AdminLogout: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    sessionStorage.removeItem("adminData");
    window.location.href = "/admin/login";
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
                        <DeviceSelection />
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
                      <LoginPage />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/profile"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ProfilePage />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/orders"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ProfilePage />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/devices"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ProfilePage />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/history"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ProfilePage />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/settings"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ProfilePage />
                    </main>
                    <Footer />
                  </>
                }
              />

              {/* Shop Route - Database connected marketplace */}
              <Route
                path="/shop"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ShopPage />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/shop/buyhome"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ShopPage />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/shop/products"
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
                path="/shop/details/:slug"
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
                path="/shop/checkout"
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
                path="/shop/payment"
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
                path="/shop/invoice"
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
                  <Route path="device-types" element={<AdminDeviceTypes />} />
                  <Route path="brands" element={<AdminBrands />} />
                  <Route path="models" element={<AdminModels />} />
                  <Route path="device-models" element={<AdminModels />} />
                  <Route path="devices" element={<AdminDevices />} />

                  {/* Buyback Program */}
                  <Route path="buyback" element={<AdminBuybacksNew />} />
                  <Route
                    path="condition-questions"
                    element={<ConditionQuestionsAdmin />}
                  />
                  <Route path="price-conditions" element={<AdminPricing />} />
                  <Route path="valuations" element={<AdminPricing />} />
                  <Route path="partner-program" element={<AdminBuybacks />} />

                  {/* E-commerce */}
                  <Route path="products" element={<AdminProducts />} />
                  <Route
                    path="product-categories"
                    element={<AdminCategories />}
                  />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route
                    path="marketplace"
                    element={<AdminMarketplaceSettings />}
                  />
                  <Route
                    path="marketplace-settings"
                    element={<AdminMarketplaceSettings />}
                  />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="discounts" element={<AdminDashboard />} />
                  <Route path="inventory" element={<AdminProducts />} />
                  <Route
                    path="shipping"
                    element={<AdminMarketplaceSettings />}
                  />
                  <Route
                    path="payments"
                    element={<AdminMarketplaceSettings />}
                  />
                  <Route path="revolutionary" element={<AdminDevices />} />
                  <Route path="analytics" element={<AdminDashboard />} />
                  <Route path="campaigns" element={<AdminDashboard />} />
                  <Route path="promotions" element={<AdminDashboard />} />
                  <Route path="coupons" element={<AdminDashboard />} />
                  <Route path="media" element={<AdminDashboard />} />
                  <Route path="blog" element={<AdminDashboard />} />
                  <Route path="reviews" element={<AdminDashboard />} />
                  <Route path="security" element={<AdminSettings />} />

                  {/* Region & Partner Management */}
                  <Route path="regions" element={<RegionsManagement />} />
                  <Route path="partners" element={<PartnersManagement />} />
                  <Route path="partner-staff" element={<AdminUsers />} />
                  <Route path="pin-codes" element={<AdminDashboard />} />

                  {/* Questionnaires */}
                  <Route path="brand-questionnaires" element={<AdminCQS />} />

                  {/* Routes & Templates */}
                  <Route path="routes" element={<RouteManagement />} />
                  <Route path="route-rules" element={<ManageRouteRules />} />
                  <Route path="store-templates" element={<AdminDashboard />} />
                  <Route path="store-themes" element={<AdminDashboard />} />
                  <Route
                    path="invoice-templates"
                    element={<AdminDashboard />}
                  />

                  {/* User Management */}
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="user-roles" element={<UserRoleManagement />} />
                  <Route path="permissions" element={<UserRoleManagement />} />

                  {/* Other Settings */}
                  <Route path="faq" element={<AdminDashboard />} />
                  <Route path="settings" element={<AdminSettings />} />
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
