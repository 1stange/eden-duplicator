import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

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
  created_at: string;
}

interface AuthContextType {
  user: Profile | null;
  supabaseUser: SupabaseUser | null;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setUser(data as Profile);
    // Check admin role
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    setIsAdmin(roles?.some((r: any) => r.role === "admin") || false);
    return data as Profile | null;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        // Use setTimeout to avoid potential deadlock with Supabase client
        setTimeout(() => fetchProfile(session.user.id), 0);
      } else {
        setSupabaseUser(null);
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signup = async (data: SignupData) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: `${data.firstName} ${data.lastName}` }
      }
    });
    if (error) return { error: error.message };
    
    // Update profile with extra data
    if (authData.user) {
      await supabase.from("profiles").update({
        name: `${data.firstName} ${data.lastName}`,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        city: data.city,
        role: data.role,
        company_name: data.companyName || null,
        pseudo: data.pseudo || null,
        gender: data.gender,
        birth_date: data.birthDate,
      }).eq("id", authData.user.id);
      
      await fetchProfile(authData.user.id);
    }
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setIsAdmin(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return null;
    const { data, error } = await supabase.from("profiles").update(updates).eq("id", user.id).select().single();
    if (data && !error) {
      setUser(data as Profile);
      return data as Profile;
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, login, signup, logout, updateProfile, isAuthenticated: !!user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
