import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MiningPage from "./pages/MiningPage";
import WithdrawalPage from "./pages/WithdrawalPage";
import ReferralPage from "./pages/ReferralPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import CalculatorPage from "./pages/tools/CalculatorPage";
import HashrateConverterPage from "./pages/tools/HashrateConverterPage";
import BenchmarkPage from "./pages/tools/BenchmarkPage";
import NetworkExplorerPage from "./pages/tools/NetworkExplorerPage";
import PoolExplorerPage from "./pages/tools/PoolExplorerPage";
import PriceTrackerPage from "./pages/tools/PriceTrackerPage";
import MoneroMiningArticle from "./pages/learn/MoneroMiningArticle";
import RandomXArticle from "./pages/learn/RandomXArticle";
import BrowserVsGpuArticle from "./pages/learn/BrowserVsGpuArticle";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/mining" element={<ProtectedRoute><MiningPage /></ProtectedRoute>} />
            <Route path="/withdrawals" element={<ProtectedRoute><WithdrawalPage /></ProtectedRoute>} />
            <Route path="/referrals" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            {/* Tool pages */}
            <Route path="/tools/calculator" element={<CalculatorPage />} />
            <Route path="/tools/converter" element={<HashrateConverterPage />} />
            <Route path="/tools/benchmark" element={<BenchmarkPage />} />
            <Route path="/tools/network" element={<NetworkExplorerPage />} />
            <Route path="/tools/pools" element={<PoolExplorerPage />} />
            <Route path="/tools/price" element={<PriceTrackerPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
