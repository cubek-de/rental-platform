import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { Spinner } from "flowbite-react";

// Layout Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Page Components
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const EmailVerificationPage = lazy(() =>
  import("./pages/EmailVerificationPage")
);
const VehicleListPage = lazy(() => import("./pages/VehicleListPage"));
const VehicleDetailPage = lazy(() => import("./pages/VehicleDetailPage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Admin Pages
const AdminDashboardPage = lazy(() =>
  import("./pages/admin/AdminDashboardPage")
);
const AdminProfilePage = lazy(() => import("./pages/admin/AdminProfilePage"));

// Agent Pages
const AgentDashboardPage = lazy(() =>
  import("./pages/agent/AgentDashboardPage")
);
const SimpleAgentDashboard = lazy(() =>
  import("./pages/agent/SimpleAgentDashboard")
);
const AgentProfilePage = lazy(() => import("./pages/agent/AgentProfilePage"));

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
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Spinner size="xl" />
            </div>
          }
        >
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
        </Suspense>
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
