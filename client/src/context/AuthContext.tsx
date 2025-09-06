import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  emailConfirmed: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Token management utilities - direct localStorage access
  const getStoredToken = useCallback(() => {
    return localStorage.getItem("jwt_token");
  }, []);

  const getStoredUser = useCallback(() => {
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  }, []);

  const clearStoredAuth = useCallback(() => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
  }, []);

  const setStoredAuth = useCallback(
    (token: string, userData: User, refreshToken?: string) => {
      localStorage.setItem("jwt_token", token);
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
      localStorage.setItem("user_data", JSON.stringify(userData));
    },
    []
  );

  // Validate stored authentication on app load
  const validateStoredAuth = useCallback(async () => {
    try {
      const token = getStoredToken();
      const storedUser = getStoredUser();

      if (!token || !storedUser) {
        clearStoredAuth();
        return false;
      }

      // Validate token with backend
      try {
        const { authService } = await import("../services/authService");
        const response = await authService.getCurrentUser();

        if (response.data) {
          // Token is valid, update user data
          const userData = response.data;
          const user = {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            role: userData.role,
            isActive: userData.isActive || false,
            isVerified: userData.isVerified || false,
            emailConfirmed: userData.emailConfirmed || false,
            createdAt: userData.createdAt || new Date().toISOString(),
            lastLoginAt: userData.lastLoginAt,
          };

          // Update stored user data
          setStoredAuth(token, user);
          setUser(user);
          return true;
        }
      } catch (error) {
        console.log("🔍 Token validation failed with backend:", error);
        // Token is invalid, clear auth
        clearStoredAuth();
        setUser(null);
        return false;
      }

      return false;
    } catch (error) {
      console.error("🔍 Auth validation error:", error);
      clearStoredAuth();
      setUser(null);
      return false;
    }
  }, [getStoredToken, getStoredUser, clearStoredAuth, setStoredAuth]);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        await validateStoredAuth();
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        clearStoredAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [validateStoredAuth, clearStoredAuth]);

  // Session conflict detection and management
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Only handle changes from other tabs
      if (e.key === "jwt_token" && e.newValue !== e.oldValue) {
        // If we have a different token, logout this user
        if (e.newValue && e.newValue !== getStoredToken()) {
          clearStoredAuth();
          setUser(null);

          // Show user-friendly message
          alert(
            "Another user has logged in. You have been logged out for security reasons."
          );

          // Redirect to login
          window.location.href = "/login";
        }
      }
    };

    const handleBeforeUnload = () => {
      // Set a flag to indicate this tab is closing
      sessionStorage.setItem("tab_closing", "true");
    };

    // Listen for storage changes (other tabs)
    window.addEventListener("storage", handleStorageChange);

    // Listen for tab closing
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Check if this tab was closed and reopened
    const wasClosing = sessionStorage.getItem("tab_closing");
    if (wasClosing) {
      sessionStorage.removeItem("tab_closing");
      // Refresh auth state to ensure consistency
      validateStoredAuth();
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [validateStoredAuth, clearStoredAuth, getStoredToken]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      clearStoredAuth();

      const { authService } = await import("../services/authService");
      const response = await authService.login({ email, password });
      console.log("AuthContext: API response received:", response);

      const userData = response.data.user;
      const token = response.data.token;
      const refreshToken = response.data.refreshToken;

      console.log("AuthContext: User data extracted:", userData);

      const user = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        role: userData.role,
        isActive: userData.isActive || false,
        isVerified: userData.isVerified || false,
        emailConfirmed: userData.emailConfirmed || false,
        createdAt: userData.createdAt || new Date().toISOString(),
        lastLoginAt: userData.lastLoginAt,
      };

      // Store authentication data
      console.log("🔐 Storing auth data...");
      setStoredAuth(token, user, refreshToken);

      // Update state
      console.log("🔐 Setting user state...");
      setUser(user);

      console.log("🔐 AuthContext: Login successful, user authenticated");
      console.log("🔐 Current user state:", user);
      console.log("🔐 Token exists:", !!token);
    } catch (error) {
      console.error("Login failed:", error);
      // Clear any partial auth data
      clearStoredAuth();
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { authService } = await import("../services/authService");
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Always clear local state and storage
      clearStoredAuth();
      setUser(null);
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const { authService } = await import("../services/authService");
      const response = await authService.getCurrentUser();
      const userData = response.data;

      const user = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        role: userData.role,
        isActive: userData.isActive || false,
        isVerified: userData.isVerified || false,
        emailConfirmed: userData.emailConfirmed || false,
        createdAt: userData.createdAt || new Date().toISOString(),
        lastLoginAt: userData.lastLoginAt,
      };

      // Update stored user data
      const token = getStoredToken();
      if (token) {
        setStoredAuth(token, user);
      }

      setUser(user);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // Clear invalid auth data
      clearStoredAuth();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!localStorage.getItem("jwt_token"),
    loading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
