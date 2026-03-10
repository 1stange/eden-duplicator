import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { auth as authStorage, initializeData } from "@/lib/localStorage";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => User | null;
  signup: (data: Omit<User, "id" | "createdAt" | "avatar">) => User;
  logout: () => void;
  updateUser: (updates: Partial<User>) => User | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    initializeData();
    const currentUser = authStorage.getCurrentUser();
    if (currentUser) setUser(currentUser);
  }, []);

  const login = (email: string, _password: string) => {
    const u = authStorage.login(email, _password);
    if (u) setUser(u);
    return u;
  };

  const signup = (data: Omit<User, "id" | "createdAt" | "avatar">) => {
    const u = authStorage.signup(data);
    setUser(u);
    return u;
  };

  const logout = () => {
    authStorage.logout();
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    const u = authStorage.updateUser(updates);
    if (u) setUser(u);
    return u;
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
