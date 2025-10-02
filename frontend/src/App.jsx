import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// Layout Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Page Components
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import VehicleListPage from "./pages/VehicleListPage";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import BookingPage from "./pages/BookingPage";
import UserDashboard from "./pages/UserDashboard";
import NotFoundPage from "./pages/NotFoundPage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";

// Agent Pages
import AgentDashboardPage from "./pages/agent/AgentDashboardPage";
import SimpleAgentDashboard from "./pages/agent/SimpleAgentDashboard";
import AgentProfilePage from "./pages/agent/AgentProfilePage";

// Context
import { AuthProvider } from "./context/AuthContext";

const AppLayout = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/verify-email");
  const isAdminPage = location.pathname.startsWith("/admin");
  const isAgentPage = location.pathname.startsWith("/agent");
  const isUserPage = location.pathname.startsWith("/dashboard");

  return (
    <div className="flex flex-col min-h-screen">
      {!isLandingPage &&
        !isAuthPage &&
        !isAdminPage &&
        !isAgentPage &&
        !isUserPage && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
          <Route
            path="/verify-email/:token"
            element={<EmailVerificationPage />}
          />
          <Route path="/vehicles" element={<VehicleListPage />} />
          <Route path="/vehicles/:slug" element={<VehicleDetailPage />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/dashboard/*" element={<UserDashboard />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />

          {/* Agent Routes */}
          <Route path="/agent/dashboard" element={<AgentDashboardPage />} />
          <Route path="/agent/profile" element={<AgentProfilePage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isAuthPage && !isAdminPage && !isAgentPage && !isUserPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
