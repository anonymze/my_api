import type { AppUser } from "@/front/types/user";
import { createContext, useState, type ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (appUser: AppUser) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("commission-jwt-token"),
  );
  const [isLoading, setIsLoading] = useState(false);

  const login = (appUser: AppUser) => {
    setToken(appUser.user.apiKey);
    localStorage.setItem("commission-jwt-token", appUser.user.apiKey);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("commission-jwt-token");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
