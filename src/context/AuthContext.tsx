import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api } from '../services/api.js';
import { supabase } from '../lib/supabaseClient.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      try {
        // First check Supabase Auth session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const u = session.user;
          const role = (u.user_metadata?.role || (u.email === 'admin@subhamusic.com' || u.email === 'admin@musichub.com' ? 'admin' : 'user')) as 'user' | 'admin';
          setUser({
            id: u.id,
            email: u.email || '',
            name: u.user_metadata?.name || u.email?.split('@')[0] || 'User',
            role,
            avatar: u.user_metadata?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            bio: u.user_metadata?.bio || 'Music Curator on Subha Music',
            createdAt: u.created_at
          });
          setLoading(false);
          return;
        }

        // Fallback check against backend API
        const currentUser = await api.getMe();
        setUser(currentUser);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();

    // Listen to Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = session.user;
        const role = (u.user_metadata?.role || (u.email === 'admin@subhamusic.com' || u.email === 'admin@musichub.com' ? 'admin' : 'user')) as 'user' | 'admin';
        setUser({
          id: u.id,
          email: u.email || '',
          name: u.user_metadata?.name || u.email?.split('@')[0] || 'User',
          role,
          avatar: u.user_metadata?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          bio: u.user_metadata?.bio || 'Music Curator on Subha Music',
          createdAt: u.created_at
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setError(null);
    try {
      // Try Supabase Auth first
      const { data, error: supaErr } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });
      if (data?.session?.user && !supaErr) {
        const u = data.session.user;
        const role = (u.user_metadata?.role || (u.email === 'admin@subhamusic.com' || u.email === 'admin@musichub.com' ? 'admin' : 'user')) as 'user' | 'admin';
        setUser({
          id: u.id,
          email: u.email || '',
          name: u.user_metadata?.name || u.email?.split('@')[0] || 'User',
          role,
          avatar: u.user_metadata?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          bio: u.user_metadata?.bio || 'Music Curator on Subha Music',
          createdAt: u.created_at
        });
        return;
      }

      // If Supabase auth fails or is demo account, fallback to backend API
      const res = await api.login(email, pass);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    setError(null);
    try {
      // Sign up with Supabase
      const { data, error: supaErr } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { name, role: email.includes('admin') ? 'admin' : 'user' }
        }
      });

      const userId = data?.user?.id || `user-${Date.now()}`;
      const role = email.includes('admin') ? 'admin' : 'user';

      // Always directly insert/upsert user details into public profiles and users tables on Supabase
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          email: email.toLowerCase(),
          name,
          full_name: name,
          role,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          bio: 'Music Curator on Subha Music',
          updated_at: new Date().toISOString()
        });
      } catch (errProfile) {
        console.error('Supabase profile insertion note:', errProfile);
      }

      if (data?.user && !supaErr) {
        const u = data.user;
        setUser({
          id: u.id,
          email: u.email || '',
          name,
          role: role as 'user' | 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          bio: 'Music Curator on Subha Music',
          createdAt: u.created_at || new Date().toISOString()
        });
        // Also register with API backend for hybrid synchronization
        try { await api.register(email, pass, name); } catch (_) {}
        return;
      }

      // Fallback to API
      const res = await api.register(email, pass, name);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const loginAsDemo = async () => {
    await login('alex@example.com', 'password123');
  };

  const loginAsAdmin = async () => {
    await login('admin@musichub.com', 'adminpassword123');
  };

  const logout = async () => {
    try { await supabase.auth.signOut(); } catch (_) {}
    api.logout();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      await supabase.auth.updateUser({ data: updates });
      if (user?.id) {
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          name: updates.name || user.name,
          full_name: updates.name || user.name,
          avatar: updates.avatar || user.avatar,
          avatar_url: updates.avatar || user.avatar,
          bio: updates.bio || user.bio,
          role: user.role,
          updated_at: new Date().toISOString()
        });
      }
    } catch (_) {}
    const updated = await api.updateProfile(updates);
    setUser(updated);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      loginAsDemo,
      loginAsAdmin,
      logout,
      updateProfile,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
