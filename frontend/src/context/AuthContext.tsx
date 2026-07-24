// AuthContext.tsx — Authentication state provider
// Manages: token, user info, role in state + localStorage persistence.

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { login as apiLogin, signup as apiSignup, logoutApi } from "../services/api";

interface User {
  user_id: number;
  email: string;
  role: "admin" | "user";
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: "admin" | "user") => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "vaultview_token";
const USER_KEY = "vaultview_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    // Backend returns { token, role } — build user object from what we have
    const userData: User = {
      user_id: Date.now(), // placeholder — backend doesn't return user_id on login
      email: email,
      role: result.role,
    };
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(result.token);
    setUser(userData);
  }, []);

  const signup = useCallback(
    async (email: string, password: string, role: "admin" | "user") => {
      await apiSignup(email, password, role);
    },
    []
  );

  const logout = useCallback(() => {
    if (token) logoutApi(token);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
