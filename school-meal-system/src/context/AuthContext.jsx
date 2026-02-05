import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/auth";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authApi
        .getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      const userData = await authApi.getMe();
      setUser(userData);
      toast.success("Успешный вход!");
      return { success: true, role: data.role };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      await authApi.register(userData);
      toast.success("Регистрация успешна! Войдите в систему.");
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    toast.success("Вы вышли из системы");
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isStudent: user?.role === "student",
    isChef: user?.role === "chef",
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
