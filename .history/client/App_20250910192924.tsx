import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import PrivacyPolicy from "./pages/policy/PrivacyPolicy";
import TermsOfService from "./pages/policy/TermsOfService";
import RefundPolicy from "./pages/policy/RefundPolicy";
import ShippingPolicy from "./pages/policy/ShippingPolicy";
import Cart from "./pages/Cart";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetail";
import ProductsBySubcategory from "./pages/ProductsBySubcategory";
import Categories from "./pages/Categories";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import BrowseCategories from "./pages/BrowseCategories";
import Offers from "./pages/Offers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="cart" element={<Cart />} />
                <Route path="contact" element={<Contact />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="products/subcategory/:subCategoryId" element={<ProductsBySubcategory />} />
                <Route path="categories" element={<Categories />} />
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="browse-categories" element={<BrowseCategories />} />
                <Route path="offers" element={<Offers />} />
                {/* Policy routes */}
                <Route path="policy/privacy" element={<PrivacyPolicy />} />
                <Route path="policy/terms" element={<TermsOfService />} />
                <Route path="policy/refund" element={<RefundPolicy />} />
                <Route path="policy/shipping" element={<ShippingPolicy />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
