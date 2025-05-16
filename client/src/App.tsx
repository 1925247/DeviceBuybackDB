// src/App.tsx
import React, { lazy, Suspense } from "react";
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
import LoadingSpinner from "./components/ui/LoadingSpinner";

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

// Admin Panel Pages - Lazy loaded to improve performance
import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";

// Lazy loaded admin components
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminDevices = lazy(() => import("./pages/admin/AdminDevices"));
const AdminDeviceTypes = lazy(() => import("./pages/admin/AdminDeviceTypes"));
const AdminBrands = lazy(() => import("./pages/admin/AdminBrands"));
const AdminModels = lazy(() => import("./pages/admin/AdminModels"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing"));
const AdminConfig = lazy(() => import("./pages/admin/AdminConfig"));
const AdminCQS = lazy(() => import("./pages/admin/AdminCQS"));
const AdminDiagnostic = lazy(() => import("./pages/admin/AdminDiagnostic"));
const AdminBuybacks = lazy(() => import("./pages/admin/AdminBuybacks"));
const AdminBuybacksNew = lazy(() => import("./pages/admin/AdminBuybacksNew"));
const AdminFeatureToggles = lazy(() => import("./pages/admin/AdminFeatureToggles"));
const ConditionQuestionsAdmin = lazy(() => import("./pages/admin/ConditionQuestionsAdmin"));
const AdminConditionQuestions = lazy(() => import("./pages/admin/AdminConditionQuestions"));
const AdminQuestions = lazy(() => import("./pages/admin/AdminQuestions"));
const AdminQuestionGroups = lazy(() => import("./pages/admin/AdminQuestionGroups"));
const AdminInvoiceTemplates = lazy(() => import("./pages/admin/AdminInvoiceTemplates"));
const RegionsManagement = lazy(() => import("./pages/admin/RegionsManagement"));
const UserRoleManagement = lazy(() => import("./pages/admin/UserRoleManagement"));
const RouteManagement = lazy(() => import("./pages/admin/RouteManagement"));
const ManageRouteRules = lazy(() => import("./pages/admin/ManageRouteRules"));
const PartnersManagement = lazy(() => import("./pages/admin/PartnersManagement"));
const PartnerStaffManagement = lazy(() => import("./pages/admin/PartnerStaffManagement"));
const PartnerWallets = lazy(() => import("./pages/admin/PartnerWallets"));
const PinCodeAssignment = lazy(() => import("./pages/admin/PinCodeAssignment"));
const PartnerOnboarding = lazy(() => import("./pages/admin/PartnerOnboarding"));

// Partner Portal Pages
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import StaffManagement from "./pages/partner/StaffManagement";
import StaffManagementDemo from "./pages/partner/StaffManagementDemo";

// E-commerce Admin Pages - Lazy loaded
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminMarketplaceSettings = lazy(() => import("./pages/admin/AdminMarketplaceSettings"));

// LoadingSpinner already imported above

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

              {/* Partner Portal Routes */}
              <Route
                path="/partner/dashboard"
                element={<PartnerDashboard />}
              />
              <Route
                path="/partner/staff"
                element={<StaffManagementDemo />}
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
                  <Route index element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDashboard />
                    </Suspense>
                  } />

                  {/* Device Management */}
                  <Route path="device-types" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDeviceTypes />
                    </Suspense>
                  } />
                  <Route path="brands" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminBrands />
                    </Suspense>
                  } />
                  <Route path="models" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminModels />
                    </Suspense>
                  } />
                  <Route path="device-models" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminModels />
                    </Suspense>
                  } />
                  <Route path="devices" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDevices />
                    </Suspense>
                  } />

                  {/* Buyback Program */}
                  <Route path="buyback" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminBuybacksNew />
                    </Suspense>
                  } />
                  <Route
                    path="condition-questions"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <ConditionQuestionsAdmin />
                      </Suspense>
                    }
                  />
                  <Route path="price-conditions" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminPricing />
                    </Suspense>
                  } />
                  <Route path="valuations" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminPricing />
                    </Suspense>
                  } />
                  <Route path="partner-program" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminBuybacks />
                    </Suspense>
                  } />

                  {/* E-commerce */}
                  <Route path="products" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminProducts />
                    </Suspense>
                  } />
                  <Route
                    path="product-categories"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminCategories />
                      </Suspense>
                    }
                  />
                  <Route path="categories" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminCategories />
                    </Suspense>
                  } />
                  <Route
                    path="marketplace"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminMarketplaceSettings />
                      </Suspense>
                    }
                  />
                  <Route
                    path="marketplace-settings"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminMarketplaceSettings />
                      </Suspense>
                    }
                  />
                  <Route path="orders" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminOrders />
                    </Suspense>
                  } />
                  <Route path="discounts" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDashboard />
                    </Suspense>
                  } />
                  <Route path="inventory" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminProducts />
                    </Suspense>
                  } />
                  <Route
                    path="shipping"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminMarketplaceSettings />
                      </Suspense>
                    }
                  />
                  <Route
                    path="payments"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminMarketplaceSettings />
                      </Suspense>
                    }
                  />
                  <Route path="revolutionary" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDevices />
                    </Suspense>
                  } />
                  <Route path="analytics" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDashboard />
                    </Suspense>
                  } />
                  <Route path="campaigns" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDashboard />
                    </Suspense>
                  } />
                  <Route path="promotions" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDashboard />
                    </Suspense>
                  } />
                  <Route path="coupons" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDashboard />
                    </Suspense>
                  } />
                  <Route path="media" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDashboard />
                    </Suspense>
                  } />
                  <Route path="blog" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDashboard />
                    </Suspense>
                  } />
                  <Route path="reviews" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDashboard />
                    </Suspense>
                  } />
                  <Route path="security" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminSettings />
                    </Suspense>
                  } />

                  {/* Region & Partner Management */}
                  <Route path="regions" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <RegionsManagement />
                    </Suspense>
                  } />
                  <Route path="partners" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <PartnersManagement />
                    </Suspense>
                  } />
                  <Route path="partner-staff" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <PartnerStaffManagement />
                    </Suspense>
                  } />
                  <Route path="pin-codes" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <PinCodeAssignment />
                    </Suspense>
                  } />
                  <Route path="partners-onboarding" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <PartnerOnboarding />
                    </Suspense>
                  } />
                  <Route path="partner-wallets" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <PartnerWallets />
                    </Suspense>
                  } />

                  {/* Questionnaires */}
                  <Route path="brand-questionnaires" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminCQS />
                    </Suspense>
                  } />
                  <Route path="condition-questions" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminConditionQuestions />
                    </Suspense>
                  } />
                  <Route path="condition-questions/:groupId" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminQuestions />
                    </Suspense>
                  } />
                  <Route path="question-groups" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminQuestionGroups />
                    </Suspense>
                  } />

                  {/* Routes & Templates */}
                  <Route path="routes" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <RouteManagement />
                    </Suspense>
                  } />
                  <Route path="route-rules" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <ManageRouteRules />
                    </Suspense>
                  } />
                  <Route path="store-templates" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDashboard />
                    </Suspense>
                  } />
                  <Route path="store-themes" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDashboard />
                    </Suspense>
                  } />
                  <Route
                    path="invoice-templates"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminInvoiceTemplates />
                      </Suspense>
                    }
                  />

                  {/* User Management */}
                  <Route path="users" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminUsers />
                    </Suspense>
                  } />
                  <Route path="user-roles" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <UserRoleManagement />
                    </Suspense>
                  } />
                  <Route path="permissions" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <UserRoleManagement />
                    </Suspense>
                  } />

                  {/* Other Settings */}
                  <Route path="faq" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDashboard />
                    </Suspense>
                  } />
                  <Route path="settings" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminSettings />
                    </Suspense>
                  } />
                  <Route path="feature-toggles" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminFeatureToggles />
                    </Suspense>
                  } />
                  <Route path="config" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminConfig />
                    </Suspense>
                  } />
                  <Route path="diagnostic" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDiagnostic />
                    </Suspense>
                  } />
                  <Route path="*" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <NotFound />
                    </Suspense>
                  } />
                </Route>
              </Route>

              {/* Catch-all Not Found */}
              <Route path="*" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <NotFound />
                </Suspense>
              } />
            </Routes>
          </div>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
