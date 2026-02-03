import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Страницы авторизации
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

// Страницы ученика
import { Menu } from "./pages/student/Menu";
import { Orders } from "./pages/student/Orders";
import { Profile } from "./pages/student/Profile";

// Страницы повара
import { ChefOrders } from "./pages/chef/ChefOrders";
import { ChefDishes } from "./pages/chef/ChefDishes";
import { PurchaseRequests } from "./pages/chef/PurchaseRequests";

// Страницы администратора
import { Statistics } from "./pages/admin/Statistics";
import { AdminRequests } from "./pages/admin/AdminRequests";
import { AdminDishes } from "./pages/admin/AdminDishes";
import { Reports } from "./pages/admin/Reports";

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "student":
      return <Navigate to="/menu" replace />;
    case "chef":
      return <Navigate to="/chef/orders" replace />;
    case "admin":
      return <Navigate to="/admin/statistics" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Главная страница - редирект в зависимости от роли */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Маршруты ученика */}
          <Route
            path="/menu"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Menu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Маршруты повара */}
          <Route
            path="/chef/orders"
            element={
              <ProtectedRoute allowedRoles={["chef"]}>
                <ChefOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chef/dishes"
            element={
              <ProtectedRoute allowedRoles={["chef"]}>
                <ChefDishes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chef/requests"
            element={
              <ProtectedRoute allowedRoles={["chef"]}>
                <PurchaseRequests />
              </ProtectedRoute>
            }
          />

          {/* Маршруты администратора */}
          <Route
            path="/admin/statistics"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Statistics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requests"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dishes"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDishes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
