import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@/i18n";

import { LocaleLayout } from "@/components/LocaleLayout";

import Index from "./pages/Index";
import Shop from "./pages/Shop";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/AccountPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import ReturnsPolicyPage from "./pages/ReturnsPolicyPage";
import ShippingPage from "./pages/ShippingPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import NotFound from "./pages/NotFound";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import { ProtectedRoute } from "./components/ProtectedRoute";

// Admin Imports
import AdminLogin from "./pages/admin/Login";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductsPage from "./pages/admin/products/page";
import NewProductPage from "./pages/admin/products/new";
import EditProductPage from "./pages/admin/products/edit";
import OrdersPage from "./pages/admin/orders/page";
import SettingsPage from "./pages/admin/settings/page";
import AnalyticsPage from "./pages/admin/analytics/page";
import CustomersPage from "./pages/admin/customers/page";
import DiscountsPage from "./pages/admin/discounts/page";
import ReportsPage from "./pages/admin/reports/page";
import ReviewsPage from "./pages/admin/reviews/page";
import RolesPage from "./pages/admin/roles/page";
import FlashSalesPage from "./pages/admin/flash-sales/page";
import TrackOrderPage from "./pages/TrackOrderPage";
import WishlistPage from "./pages/WishlistPage";

const queryClient = new QueryClient();

// Get default locale
const getDefaultLocale = () => localStorage.getItem('locale') || 'ar';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Root redirect to default locale */}
          <Route path="/" element={<Navigate to={`/${getDefaultLocale()}`} replace />} />

          {/* Locale-aware routes */}
          <Route path="/:locale" element={<LocaleLayout />}>
            <Route index element={<Index />} />
            <Route path="shop" element={<Shop />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="track-order" element={<TrackOrderPage />} />
            <Route path="account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="returns" element={<ReturnsPolicyPage />} />
            <Route path="shipping" element={<ShippingPage />} />
            <Route path="privacy" element={<PrivacyPolicyPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="product/:id" element={<ProductDetailsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Routes (no locale prefix) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<NewProductPage />} />
            <Route path="products/edit/:id" element={<EditProductPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="discounts" element={<DiscountsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="flash-sales" element={<FlashSalesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Legacy routes redirect to localized versions */}
          <Route path="/shop" element={<Navigate to={`/${getDefaultLocale()}/shop`} replace />} />
          <Route path="/cart" element={<Navigate to={`/${getDefaultLocale()}/cart`} replace />} />
          <Route path="/checkout" element={<Navigate to={`/${getDefaultLocale()}/checkout`} replace />} />
          <Route path="/checkout/success" element={<Navigate to={`/${getDefaultLocale()}/checkout/success`} replace />} />
          <Route path="/login" element={<Navigate to={`/${getDefaultLocale()}/login`} replace />} />
          <Route path="/register" element={<Navigate to={`/${getDefaultLocale()}/register`} replace />} />
          <Route path="/contact" element={<Navigate to={`/${getDefaultLocale()}/contact`} replace />} />
          <Route path="/about" element={<Navigate to={`/${getDefaultLocale()}/about`} replace />} />
          <Route path="/product/:id" element={<Navigate to={`/${getDefaultLocale()}/product/:id`} replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to={`/${getDefaultLocale()}`} replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
