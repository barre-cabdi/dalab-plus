import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerRegister from "./pages/CustomerRegister";
import CustomerMenu from "./pages/CustomerMenu";
import OrderTracking from "./pages/OrderTracking";
import WaiterDashboard from "./pages/WaiterDashboard";
import HotelManagerDashboard from "./pages/HotelManagerDashboard";
import CashierDashboard from "./pages/CashierDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/register" element={<CustomerRegister />} />
            <Route path="/menu" element={<CustomerMenu />} />
            <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
            <Route path="/waiter" element={<WaiterDashboard />} />
            <Route path="/hotel-manager" element={<HotelManagerDashboard />} />
            <Route path="/cashier" element={<CashierDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
