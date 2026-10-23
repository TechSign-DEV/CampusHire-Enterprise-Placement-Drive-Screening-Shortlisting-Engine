
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("campushire_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem("campushire_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  // Login: save token and authenticate the user.
  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);

    localStorage.setItem(
      "campushire_token",
      response.data.token
    );

    setUser(response.data.user);

    return response.data.user;
  };

  // Register: create account only. Do not log in automatically.
  const register = async (formData) => {
    const response = await api.post(
      "/auth/register",
      formData
    );

    return response.data;
  };

  // Logout: clear authentication.
  const logout = () => {
    localStorage.removeItem("campushire_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
