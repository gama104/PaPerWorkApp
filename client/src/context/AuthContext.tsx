import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { authService } from "../features/auth/services/authService";
import type { User } from "../features/auth/types/auth.types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate authentication using the new secure system
  const validateAuth = useCallback(async () => {
    try {
      console.log("AuthContext: Validating authentication");
      const validatedUser = await authService.validateToken();

      if (validatedUser) {
        console.log("AuthContext: User validated successfully");
        setUser(validatedUser);
        return true;
      } else {
        console.log("AuthContext: No valid user found");
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("AuthContext: Authentication validation failed:", error);
      setUser(null);
      return false;
    }
  }, []);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        await validateAuth();
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [validateAuth]);

  // Listen for logout events from token service
  useEffect(() => {
    const handleLogout = () => {
      console.log("AuthContext: Logout event received from token service");
      setUser(null);
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("AuthContext: Starting login process");

      const response = await authService.login({ email, password });
      console.log("AuthContext: Login successful, user data:", response.user);

      // The authService already handles token storage via tokenService
      // We just need to set the user in our context
      setUser(response.user);

      console.log("AuthContext: User authenticated successfully");
    } catch (error) {
      console.error("AuthContext: Login failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      console.log("AuthContext: Starting logout process");
      await authService.logout();
    } catch (error) {
      console.error("AuthContext: Logout failed:", error);
    } finally {
      // Always clear local state
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      console.log("AuthContext: Refreshing user data");
      const userData = await authService.getCurrentUser();
      setUser(userData);
      console.log("AuthContext: User data refreshed successfully");
    } catch (error) {
      console.error("AuthContext: Failed to refresh user:", error);
      setUser(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    loading,
    isLoading,
    error,
    login,
    logout,
    refreshUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
