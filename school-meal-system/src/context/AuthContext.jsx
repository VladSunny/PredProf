import { createContext, useContext, useState, useEffect } from "react";
import * as api from "../api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .getMe()
        .then(setUser)
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const result = await api.login({ username, password });
    localStorage.setItem("token", result.access_token);
    const userData = await api.getMe();
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    await api.register(data);
    return login(data.username, data.password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const refreshUser = async () => {
    const userData = await api.getMe();
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
