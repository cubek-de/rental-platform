import { createContext, useState, useEffect } from "react";
import axios from "axios";
import api from "../services/api";

// Create the context
const AuthContext = createContext();

// Create the provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios defaults
  axios.defaults.baseURL =
    import.meta.env.VITE_API_URL || "http://localhost:5005";

  // Add token to all requests if available
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Load user on initial load and token change
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("/api/auth/me");
        setUser(res.data.data.user); // Fix: get the user from res.data.data.user
        setError(null);
      } catch (err) {
        console.error("Error loading user:", err);
        setError(
          err.response?.data?.message || "Fehler beim Laden des Benutzers"
        );
        // If token is invalid, clear it
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/register", userData);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Registrierung fehlgeschlagen");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.data.token);
      setToken(response.data.data.token);
      setUser(response.data.data.user);

      // Return response with redirect path based on user role
      const redirectPath = getRedirectPathByRole(response.data.data.user.role);
      return { ...response.data.data, redirectPath };
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login fehlgeschlagen.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine redirect path based on user role
  const getRedirectPathByRole = (role) => {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "agent":
        return "/agent/dashboard";
      default:
        return "/dashboard";
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setError(null);

      // Clear axios headers
      delete axios.defaults.headers.common["Authorization"];

      // Use a small delay to ensure state updates, then navigate
      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
    }
  };

  // Update profile
  const updateProfile = async (userData) => {
    setLoading(true);
    try {
      const res = await axios.put("/api/auth/update-profile", userData);
      setUser(res.data.data);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Aktualisierung fehlgeschlagen");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/change-password", passwordData);
      setError(null);
      return res.data;
    } catch (err) {
      setError(
        err.response?.data?.message || "Passwort-Änderung fehlgeschlagen"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/forgot-password", { email });
      setError(null);
      return res.data;
    } catch (err) {
      setError(
        err.response?.data?.message || "Passwort-Zurücksetzen fehlgeschlagen"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/auth/reset-password/${token}`, {
        password,
      });
      setError(null);
      return res.data;
    } catch (err) {
      setError(
        err.response?.data?.message || "Passwort-Zurücksetzen fehlgeschlagen"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/auth/verify-email/${token}`);
      if (res.data.success && token) {
        const userRes = await api.get("/api/auth/me");
        setUser(userRes.data.data);
      }
      setError(null);
      return res.data;
    } catch (err) {
      setError(
        err.response?.data?.message || "E-Mail-Verifizierung fehlgeschlagen"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const resendVerification = async (email) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/resend-verification", { email });
      setError(null);
      return res.data;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Fehler beim Senden der Verifizierungs-E-Mail"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export both the context and provider
export { AuthContext, AuthProvider };
