// src/App.jsx
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
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
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
import DeviceListing from "./pages/DeviceListing";
import CheckoutFormPage from "./pages/CheckoutFormPage";
import BuybackSuccessPage from "./pages/BuybackSuccessPage";

import FAQPage from "./pages/FAQPage";
import BlogPage from "./pages/BlogPage";
import UserLogin from "./pages/UserLogin";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";

// Admin Panel Pages - Lazy loaded to improve performance
import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";

// Lazy loaded admin components
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminDeviceTypes = lazy(() => import("./pages/admin/AdminDeviceTypesEnhanced"));
const AdminBrands = lazy(() => import("./pages/admin/AdminBrands"));
const AdminBrandsEnhanced = lazy(() => import("./pages/admin/AdminBrandsEnhanced"));
const AdminModels = lazy(() => import("./pages/admin/AdminModels"));
const AdminModelsAdvanced = lazy(() => import("./pages/admin/AdminModelsAdvanced"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminBuybacksNew = lazy(() => import("./pages/admin/AdminBuybacksNew"));
const AdminConditionQuestions = lazy(() => import("./pages/admin/AdminConditionQuestions"));
const DeviceModelQuestions = lazy(() => import("./pages/admin/DeviceModelQuestions"));
const AdminQuestionGroups = lazy(() => import("./pages/admin/AdminQuestionGroups"));
const AdminQuestionBuilder = lazy(() => import("./pages/admin/AdminQuestionBuilder"));

const AdminQuestionOverview = lazy(() => import("./pages/admin/AdminQuestionOverview"));
const BuybackSuccess = lazy(() => import("./pages/BuybackSuccess"));
const AdminBuybackRequests = lazy(() => import("./pages/admin/AdminBuybackRequests"));
const AdminLeadAnalytics = lazy(() => import("./pages/admin/AdminLeadAnalytics"));
const AdminAnalyticsSimple = lazy(() => import("./pages/admin/AdminAnalyticsSimple"));
const ModelPricingManager = lazy(() => import("./components/admin/realtime/ModelPricingManager"));
const QuestionGroupManager = lazy(() => import("./components/admin/realtime/QuestionGroupManager"));
const ConfigurationManager = lazy(() => import("./components/admin/realtime/ConfigurationManager"));
const AdminWorkingHours = lazy(() => import("./pages/admin/AdminWorkingHours"));
const AdminModelCreation = lazy(() => import("./pages/admin/AdminModelCreation"));
const AdvancedModelManagement = lazy(() => import("./pages/admin/AdvancedModelManagement"));
const AdminDashboardOverview = lazy(() => import("./pages/admin/AdminDashboardOverview"));
const AdminVariantPricing = lazy(() => import("./pages/admin/AdminVariantPricing"));
const DeviceModelsPage = lazy(() => import("./pages/sell/DeviceModelsPage"));
const VariantSelectionPage = lazy(() => import("./pages/sell/VariantSelectionPage"));
const ExactValuePage = lazy(() => import("./pages/sell/ExactValuePage"));

// Partner Portal Pages
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import StaffManagement from "./pages/partner/StaffManagement";


// Not Found Page
import NotFound from "./pages/NotFound";

// Local protected route wrapper
const LocalProtectedAdminRoute = () => {
  const sessionToken = sessionStorage.getItem("adminToken");
  const persistentToken = localStorage.getItem("adminToken");
  const isAuthenticated = Boolean(sessionToken || persistentToken);

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

const AdminLogout = () => {
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  React.useEffect(() => {
    handleLogout();
  }, []);

  return <div>Logging out...</div>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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
                      <HomePage />
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
              
              <Route
                path="/devices"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <DeviceListing />
                    </main>
                    <Footer />
                  </>
                }
              />
              
              <Route
                path="/sell"
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
                        <DeviceModelsPage />
                      </ModelsProvider>
                    </main>
                    <Footer />
                  </>
                }
              />
              
              <Route
                path="/sell/:deviceType/:brand/:model/variants"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ModelsProvider>
                        <VariantSelectionPage />
                      </ModelsProvider>
                    </main>
                    <Footer />
                  </>
                }
              />
              
              <Route
                path="/sell/:deviceType/:brand/:model/:variant/value"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ModelsProvider>
                        <ExactValuePage />
                      </ModelsProvider>
                    </main>
                    <Footer />
                  </>
                }
              />
              
              <Route
                path="/sell/:deviceType/:brand/:model/variants"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ModelsProvider>
                        <Suspense fallback={<LoadingSpinner />}>
                          <VariantSelectionPage />
                        </Suspense>
                      </ModelsProvider>
                    </main>
                    <Footer />
                  </>
                }
              />
              
              <Route
                path="/sell/:deviceType/:brand/:model/:variant/value"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ModelsProvider>
                        <Suspense fallback={<LoadingSpinner />}>
                          <ExactValuePage />
                        </Suspense>
                      </ModelsProvider>
                    </main>
                    <Footer />
                  </>
                }
              />
              
              <Route
                path="/sell/:deviceType/:brand/:model/:variant/condition"
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
                path="/sell/:deviceType/:brand/:model/checkout"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <CheckoutFormPage />
                    </main>
                    <Footer />
                  </>
                }
              />
              
              <Route
                path="/buyback-success"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <BuybackSuccessPage />
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

              {/* Partner Portal Routes */}
              <Route
                path="/partner/dashboard"
                element={<PartnerDashboard />}
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
                      <AdminDashboardOverview />
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
                      <AdminBrandsEnhanced />
                    </Suspense>
                  } />
                  <Route path="models" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminModels />
                    </Suspense>
                  } />
                  <Route path="models-advanced" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminModelsAdvanced />
                    </Suspense>
                  } />

                  <Route path="create-model" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminModelCreation />
                    </Suspense>
                  } />

                  <Route path="advanced-model-management" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdvancedModelManagement />
                    </Suspense>
                  } />

                  <Route path="variant-pricing" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminVariantPricing />
                    </Suspense>
                  } />

                  {/* Q&A Management */}
                  <Route
                    path="question-overview"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminQuestionOverview />
                      </Suspense>
                    }
                  />
                  <Route
                    path="question-groups"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminQuestionGroups />
                      </Suspense>
                    }
                  />
                  <Route
                    path="question-builder"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminQuestionBuilder />
                      </Suspense>
                    }
                  />

                  <Route
                    path="condition-questions"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminConditionQuestions />
                      </Suspense>
                    }
                  />
                  <Route
                    path="device-model-questions"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <DeviceModelQuestions />
                      </Suspense>
                    }
                  />

                  {/* Buyback Management */}
                  <Route path="buyback" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminBuybacksNew />
                    </Suspense>
                  } />

                  {/* Other Admin Routes */}
                  <Route path="orders" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminOrders />
                    </Suspense>
                  } />
                  <Route path="users" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminUsers />
                    </Suspense>
                  } />
                  <Route path="analytics" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminAnalyticsSimple />
                    </Suspense>
                  } />
                  <Route path="pricing-manager" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <ModelPricingManager />
                    </Suspense>
                  } />
                  <Route path="question-groups" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <QuestionGroupManager />
                    </Suspense>
                  } />
                  <Route path="configuration" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <ConfigurationManager />
                    </Suspense>
                  } />
                  <Route path="working-hours" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminWorkingHours />
                    </Suspense>
                  } />
                  <Route path="settings" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminSettings />
                    </Suspense>
                  } />

                  {/* Catch all admin route */}
                  <Route path="*" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDashboard />
                    </Suspense>
                  } />
                </Route>
              </Route>

              {/* Logout route */}
              <Route path="/admin/logout" element={<AdminLogout />} />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;