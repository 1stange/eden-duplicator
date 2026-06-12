import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authStore } from "@/lib/localStorage";

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string;
  avatar: string | null;
  first_name: string | null;
  last_name: string | null;
  pseudo: string | null;
  gender: string | null;
  role: string | null;
  company_name: string | null;
  birth_date: string | null;
  is_certified?: boolean;
  created_at: string;
}

interface AuthContextType {
  user: Profile | null;
  supabaseUser: null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (data: SignupData) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<Profile | null>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  phone: string;
  city: string;
  role: string;
  companyName?: string;
  pseudo?: string;
  gender: string;
  firstName: string;
  lastName: string;
  birthDate: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toProfile(p: any | null): Profile | null {
  if (!p) return null;
  // Strip password before exposing
  const { password, ...safe } = p;
  return safe as Profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    const id = authStore.getCurrentUserId();
    setUser(id ? toProfile(authStore.getProfile(id)) : null);
  };

  useEffect(() => {
    refresh();
    setLoading(false);
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    window.addEventListener("eden:auth-change", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("eden:auth-change", handler);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const p = authStore.login(email, password);
    if (!p) return { error: "Email ou mot de passe incorrect." };
    setUser(toProfile(p));
    window.dispatchEvent(new CustomEvent("eden:auth-change"));
    return {};
  };

  const signup = async (data: SignupData) => {
    const result = authStore.signup({
      email: data.email,
      password: data.password,
      name: `${data.firstName} ${data.lastName}`.trim() || data.name,
      phone: data.phone,
      city: data.city,
      role: data.role,
      company_name: data.companyName || null,
      pseudo: data.pseudo || null,
      gender: data.gender,
      first_name: data.firstName,
      last_name: data.lastName,
      birth_date: data.birthDate,
    });
    if (result.error) return { error: result.error };
    setUser(toProfile(result.profile));
    window.dispatchEvent(new CustomEvent("eden:auth-change"));
    return {};
  };

  const logout = async () => {
    authStore.logout();
    setUser(null);
    window.dispatchEvent(new CustomEvent("eden:auth-change"));
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return null;
    const updated = authStore.updateProfile(user.id, updates as any);
    const p = toProfile(updated);
    if (p) setUser(p);
    return p;
  };

  const isAdmin = !!user && (user.role === "admin" || authStore.hasRole(user.id, "admin"));

  return (
    <AuthContext.Provider value={{
      user, supabaseUser: null, login, signup, logout, updateProfile,
      isAuthenticated: !!user, isAdmin, loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
