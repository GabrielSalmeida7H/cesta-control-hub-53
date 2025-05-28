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
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
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
          // Defer user profile fetching to avoid deadlock
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
      console.log('Fetching user profile for:', userId);
      
      // Primeiro, tenta buscar o usuário existente
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          institution:institutions(*)
        `)
        .eq('id', userId)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', userError);
        // Se há erro que não é "usuário não encontrado", criar usuário básico
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user) {
          const basicUser: AuthUser = {
            id: authUser.user.id,
            email: authUser.user.email || '',
            name: authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'Usuário',
            type: authUser.user.email === 'admin@araguari.mg.gov.br' ? 'admin' : 'normal'
          };
          setUser(basicUser);
        }
        return;
      }

      if (!userData) {
        // Usuário não existe na tabela, vamos criar
        console.log('User not found, creating...');
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user) {
          const newUserData = {
            id: authUser.user.id,
            email: authUser.user.email || '',
            name: authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'Usuário',
            type: authUser.user.email === 'admin@araguari.mg.gov.br' ? 'admin' : 'normal'
          };

          const { error: insertError } = await supabase
            .from('users')
            .insert(newUserData);

          if (insertError) {
            console.error('Error creating user profile:', insertError);
            // Se não conseguir criar, usar dados básicos
            setUser(newUserData as AuthUser);
            return;
          }

          // Buscar novamente após criação
          const { data: newUser } = await supabase
            .from('users')
            .select(`
              *,
              institution:institutions(*)
            `)
            .eq('id', userId)
            .single();

          if (newUser) {
            const authUser: AuthUser = {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              type: newUser.type as 'admin' | 'normal',
              institution_id: newUser.institution_id,
              institution: newUser.institution ? {
                id: newUser.institution.id,
                name: newUser.institution.name,
                address: newUser.institution.address,
                phone: newUser.institution.phone,
              } : undefined
            };
            setUser(authUser);
          }
        }
      } else {
        // Usuário existe
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
      // Em caso de erro, usar dados básicos do auth
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user) {
        const basicUser: AuthUser = {
          id: authUser.user.id,
          email: authUser.user.email || '',
          name: authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'Usuário',
          type: authUser.user.email === 'admin@araguari.mg.gov.br' ? 'admin' : 'normal'
        };
        setUser(basicUser);
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      console.log('Login successful:', data.user);
      return !!data.user;
    } catch (error) {
      console.error('Error in login:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return false;
      }

      return !!data.user;
    } catch (error) {
      console.error('Error in signup:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error in logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
