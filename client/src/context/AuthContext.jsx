import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem("datapulse_token");
    return t && t !== "null" && t !== "undefined" ? t : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Validate existing token on boot
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("datapulse_token");
      if (storedToken && storedToken !== "null" && storedToken !== "undefined") {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (error) {
          console.warn("Session check failed, signing out:", error.message);
          logout();
        }
      } else {
        if (storedToken) {
          localStorage.removeItem("datapulse_token");
        }
        setToken(null);
        setUser(null);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.token) {
      localStorage.setItem("datapulse_token", res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || "Login failed");
  };

  const register = async (name, email, password) => {
    const res = await api.register(name, email, password);
    if (res.success && res.token) {
      localStorage.setItem("datapulse_token", res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || "Registration failed");
  };

  const logout = () => {
    localStorage.removeItem("datapulse_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
