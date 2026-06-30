import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

export type Language = 'kn' | 'en';

export interface CustomerSession {
  token: string;
  phone: string;
  full_name: string | null;
}

interface AuthContextType {
  // Admin auth (Supabase)
  adminUser: User | null;
  adminSession: Session | null;
  profile: Profile | null;

  // Customer auth (phone/OTP session)
  customerSession: CustomerSession | null;

  // Derived helpers
  isAdmin: boolean;
  isCustomer: boolean;
  isLoggedIn: boolean;
  customerPhone: string | null;

  language: Language;
  setLanguage: (l: Language) => void;
  loading: boolean;

  // Admin sign in/out
  adminSignOut: () => Promise<void>;

  // Customer sign in/out
  setCustomerSession: (s: CustomerSession | null) => void;
  customerSignOut: () => void;

  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'skds_customer_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminSession, setAdminSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [customerSession, setCustomerSessionState] = useState<CustomerSession | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [language, setLangState] = useState<Language>(
    () => (localStorage.getItem('skds_lang') as Language) || 'kn'
  );
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string): Promise<Profile | null> => {
    console.log("[AuthContext] Fetching profile for user:", uid);
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (error) {
      console.error("[AuthContext] Error fetching profile:", error);
    }
    console.log("[AuthContext] Fetched profile:", data);
    setProfile(data);
    return data;
  };

  const refreshProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await fetchProfile(user.id);
    } else if (adminUser) {
      await fetchProfile(adminUser.id);
    }
  };

  // Validate stored customer session against DB on mount
  useEffect(() => {
    const validateCustomerSession = async () => {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      try {
        const stored: CustomerSession = JSON.parse(raw);
        const { data } = await supabase
          .from('customer_sessions')
          .select('id, phone, full_name, expires_at')
          .eq('token', stored.token)
          .maybeSingle();
        if (!data || new Date(data.expires_at) < new Date()) {
          localStorage.removeItem(SESSION_KEY);
          setCustomerSessionState(null);
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
        setCustomerSessionState(null);
      }
    };
    validateCustomerSession();
  }, []);

  // Admin Supabase auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminSession(session);
      setAdminUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      (async () => {
        setAdminSession(session);
        setAdminUser(session?.user ?? null);
        if (session?.user) await fetchProfile(session.user.id);
        else setProfile(null);
        setLoading(false);
      })();
    });
    return () => subscription.unsubscribe();
  }, []);

  const setLanguage = (l: Language) => {
    setLangState(l);
    localStorage.setItem('skds_lang', l);
  };

  const setCustomerSession = (s: CustomerSession | null) => {
    setCustomerSessionState(s);
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  };

  const adminSignOut = async () => {
    await supabase.auth.signOut();
    setAdminUser(null);
    setAdminSession(null);
    setProfile(null);
  };

  const customerSignOut = () => {
    setCustomerSession(null);
  };

  const isAdmin = !!adminUser && profile?.role === 'admin';
  const isCustomer = !!customerSession;
  const isLoggedIn = isAdmin || isCustomer;
  const customerPhone = customerSession?.phone ?? null;

  return (
    <AuthContext.Provider value={{
      adminUser, adminSession, profile,
      customerSession,
      isAdmin, isCustomer, isLoggedIn, customerPhone,
      language, setLanguage,
      loading,
      adminSignOut,
      setCustomerSession, customerSignOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}
