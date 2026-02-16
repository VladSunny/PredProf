import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import MainLayout from "./components/layout/MainLayout";

// Landing & Auth Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import MenuPage from "./pages/student/MenuPage";
import OrdersPage from "./pages/student/OrdersPage";
import ProfilePage from "./pages/student/ProfilePage";

// Chef Pages
import ChefDashboard from "./pages/chef/ChefDashboard";
import StockPage from "./pages/chef/StockPage";
import PurchaseRequestsPage from "./pages/chef/PurchaseRequestsPage";
import ChefOrdersPage from "./pages/chef/OrdersPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageDishesPage from "./pages/admin/ManageDishesPage";
import ManageRequestsPage from "./pages/admin/ManageRequestsPage";
import ReportsPage from "./pages/admin/ReportsPage";

// Protected Route Components
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (isAuthenticated) {
    switch (user?.role) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "chef":
        return <Navigate to="/chef" replace />;
      default:
        return <Navigate to="/student" replace />;
    }
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Chef Routes */}
      <Route
        path="/chef"
        element={
          <ProtectedRoute allowedRoles={["chef"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ChefDashboard />} />
        <Route path="stock" element={<StockPage />} />
        <Route path="requests" element={<PurchaseRequestsPage />} />
        <Route path="orders" element={<ChefOrdersPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dishes" element={<ManageDishesPage />} />
        <Route path="requests" element={<ManageRequestsPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>

      {/* Default Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
