
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  type: 'admin' | 'normal';
  institution_id?: string;
  institution?: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile data
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          institution:institutions(*)
        `)
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user profile:', userError);
        return;
      }

      if (userData) {
        const authUser: AuthUser = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          type: userData.type as 'admin' | 'normal',
          institution_id: userData.institution_id,
          institution: userData.institution ? {
            id: userData.institution.id,
            name: userData.institution.name,
            address: userData.institution.address,
            phone: userData.institution.phone,
          } : undefined
        };
        
        setUser(authUser);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // First check if user exists in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        console.error('User not found in users table:', userError);
        return false;
      }

      // For demo purposes, we'll do a simple password check
      // In production, you should use proper Supabase Auth
      const validCredentials = 
        (email === 'admin@araguari.mg.gov.br' && password === 'admin123') ||
        (email === 'user@araguari.mg.gov.br' && password === 'user123');

      if (!validCredentials) {
        return false;
      }

      // Create a mock session for demo
      const authUser: AuthUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        type: userData.type as 'admin' | 'normal',
        institution_id: userData.institution_id,
      };

      // Fetch institution data if user has one
      if (userData.institution_id) {
        const { data: institutionData } = await supabase
          .from('institutions')
          .select('*')
          .eq('id', userData.institution_id)
          .single();

        if (institutionData) {
          authUser.institution = {
            id: institutionData.id,
            name: institutionData.name,
            address: institutionData.address,
            phone: institutionData.phone,
          };
        }
      }

      setUser(authUser);
      localStorage.setItem('demoUser', JSON.stringify(authUser));
      return true;
    } catch (error) {
      console.error('Error in login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem('demoUser');
  };

  // Check for demo user in localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('demoUser');
    if (savedUser && !user) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
