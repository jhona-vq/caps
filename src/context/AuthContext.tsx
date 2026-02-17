import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'official' | 'resident';

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  age?: number;
  address?: string;
  contact?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  userRole: UserRole | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  registerResident: (data: {
    firstName: string;
    lastName: string;
    middleName?: string;
    age: number;
    address: string;
    contact: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (data) setProfile(data as Profile);
  };

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    if (data) setUserRole(data.role as UserRole);
  };

  useEffect(() => {
    let isMounted = true;

    // Listener for ONGOING auth changes - does NOT control isLoading
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          setUser(session.user);
          // Defer to avoid deadlock, but don't touch isLoading here
          setTimeout(async () => {
            if (!isMounted) return;
            await Promise.all([
              fetchProfile(session.user.id),
              fetchRole(session.user.id),
            ]);
          }, 0);
        } else {
          setUser(null);
          setProfile(null);
          setUserRole(null);
        }
      }
    );

    // INITIAL load - controls isLoading
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          await Promise.all([
            fetchProfile(session.user.id),
            fetchRole(session.user.id),
          ]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    
    // Fetch role immediately after login so routing works
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      await Promise.all([
        fetchProfile(authUser.id),
        fetchRole(authUser.id),
      ]);
    }
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const registerResident = async (data: {
    firstName: string;
    lastName: string;
    middleName?: string;
    age: number;
    address: string;
    contact: string;
    email: string;
    password: string;
  }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
      },
    });

    if (error) return { success: false, error: error.message };

    if (authData.user) {
      await supabase
        .from('profiles')
        .update({
          middle_name: data.middleName || null,
          age: data.age,
          address: data.address,
          contact: data.contact,
          status: 'Active',
        })
        .eq('user_id', authData.user.id);
    }

    await supabase.auth.signOut();
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      userRole,
      login,
      logout,
      registerResident,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
