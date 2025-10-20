import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import config from '../config';

export interface User {
  id: number;
  phone_no: string;
  token: string;
  role_id: number;
  role_name: string;
}

interface AuthContextType {
  user: User | null;
  login: (phone_no: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('partykart-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('partykart-user');
      }
    }
  }, []);

  // Save user to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('partykart-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('partykart-user');
    }
  }, [user]);

  const login = async (phone_no: string, password: string) => {
    try {
      const response = await fetch(config.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_no, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        const userData: User = {
          id: data.user?.id || 0,
          phone_no: data.user?.phone_no || phone_no,
          token: data.token,
          role_id: data.user?.role || 3, // Default to regular user
          role_name: data.user?.['role name'] || 'user'
        };
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: data.detail || data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role_id === 2;
  };

  const isSuperAdmin = () => {
    return user?.role_id === 1;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAdmin,
      isSuperAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
