// Secure Auth Context with Industry Best Practices
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { authService } from "../services/authService";
import { tokenService } from "../services/tokenService";
import type {
  AuthContextType,
  AuthState,
  User,
  UserRole,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
} from "../types/auth.types";

// Auth Actions
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User } }
  | { type: "AUTH_FAILURE"; payload: { error: string } }
  | { type: "AUTH_LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOADING"; payload: { loading: boolean } };

// Initial State
const initialState: AuthState = {
  user: null,
  accessToken: null, // ⚠️ SECURITY: Never persisted, memory only
  isAuthenticated: false,
  isLoading: true, // Start with loading to check existing session
  error: null,
};

// Auth Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        accessToken: tokenService.getAccessToken(),
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload.loading,
      };

    default:
      return state;
  }
}

// Create Context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Login function
   * ✅ SECURE: Tokens handled securely by services
   */
  const login = useCallback(async (credentials: LoginRequest) => {
    dispatch({ type: "AUTH_START" });

    try {
      const { user } = await authService.login(credentials);
      dispatch({ type: "AUTH_SUCCESS", payload: { user } });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      dispatch({ type: "AUTH_FAILURE", payload: { error: errorMessage } });
      throw error;
    }
  }, []);

  /**
   * Register function
   */
  const register = useCallback(async (userData: RegisterRequest) => {
    dispatch({ type: "AUTH_START" });

    try {
      const { user } = await authService.register(userData);
      dispatch({ type: "AUTH_SUCCESS", payload: { user } });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      dispatch({ type: "AUTH_FAILURE", payload: { error: errorMessage } });
      throw error;
    }
  }, []);

  /**
   * Logout function
   * ✅ SECURE: Complete cleanup of all tokens
   */
  const logout = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { loading: true } });

    try {
      await authService.logout();
    } catch (error) {
      console.warn("Logout error:", error);
    } finally {
      dispatch({ type: "AUTH_LOGOUT" });
    }
  }, []);

  /**
   * Refresh token function
   * ✅ SECURE: Handled by tokenService
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const validToken = await tokenService.getValidToken();
      if (validToken && state.user) {
        // Token refreshed successfully, update state
        dispatch({ type: "AUTH_SUCCESS", payload: { user: state.user } });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      await logout();
      return false;
    }
  }, [state.user, logout]);

  /**
   * Change password function
   */
  const changePassword = useCallback(
    async (passwordData: ChangePasswordRequest) => {
      try {
        await authService.changePassword(passwordData);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Password change failed";
        dispatch({ type: "AUTH_FAILURE", payload: { error: errorMessage } });
        throw error;
      }
    },
    []
  );

  /**
   * Request password reset
   */
  const resetPassword = useCallback(async (email: string) => {
    try {
      await authService.requestPasswordReset(email);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Password reset failed";
      dispatch({ type: "AUTH_FAILURE", payload: { error: errorMessage } });
      throw error;
    }
  }, []);

  /**
   * Clear error function
   */
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  /**
   * Role checking utilities
   * ✅ SECURE: Based on backend-validated user data
   */
  const hasRole = useCallback(
    (role: UserRole): boolean => {
      return state.user?.role === role;
    },
    [state.user]
  );

  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => {
      return state.user ? roles.includes(state.user.role) : false;
    },
    [state.user]
  );

  /**
   * Get current token
   */
  const getToken = useCallback((): string | null => {
    return tokenService.getAccessToken();
  }, []);

  /**
   * Initialize auth state on app start
   * ✅ SECURE: Validates existing token with backend
   */
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const user = await authService.validateToken();
        if (isMounted && user) {
          dispatch({ type: "AUTH_SUCCESS", payload: { user } });
        } else if (isMounted) {
          dispatch({ type: "AUTH_LOGOUT" });
        }
      } catch (error) {
        console.warn("Auth initialization failed:", error);
        if (isMounted) {
          dispatch({ type: "AUTH_LOGOUT" });
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Listen for logout events (from token service)
   * ✅ SECURE: Handle automatic logout on token issues
   */
  useEffect(() => {
    const handleLogout = () => {
      dispatch({ type: "AUTH_LOGOUT" });
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  // Context value
  const contextValue: AuthContextType = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    logout,
    register,
    refreshToken,
    resetPassword,
    changePassword,
    clearError,

    // Utilities
    hasRole,
    hasAnyRole,
    getToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

/**
 * Custom hook to use auth context
 * ✅ SECURE: Ensures context is used within provider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export default AuthContext;
