import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
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
  register: (phone_no: string, password: string) => Promise<{ success: boolean; error?: string }>;
  handleTokenExpiration: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to check if JWT token is expired
function isTokenExpired(token: string): boolean {
  try {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true; // Invalid token format
    }

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if exp field exists
    if (!payload.exp) {
      // If no expiration field, consider it valid (some tokens don't have exp)
      // But better to be safe and check with server
      return false;
    }

    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Add a small buffer (5 seconds) to account for clock skew
    return payload.exp < (currentTime + 5);
  } catch (error) {
    console.error('Error checking token expiration:', error);
    // If we can't decode the token, consider it expired
    return true;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount and check token validity
  useEffect(() => {
    const savedUser = localStorage.getItem('partykart-user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        
        // Check if token is expired
        if (parsedUser.token && isTokenExpired(parsedUser.token)) {
          console.log('Token expired on load, logging out...');
          // Token is expired, clear the user data
          localStorage.removeItem('partykart-user');
          setUser(null);
        } else {
          // Token is still valid, set the user
          setUser(parsedUser);
        }
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

  const handleTokenExpiration = () => {
    // Clear user data
    setUser(null);
    localStorage.removeItem('partykart-user');
    // Redirect to home page
    window.location.href = '/';
  };

  const isAdmin = () => {
    return user?.role_id === 2;
  };

  const isSuperAdmin = () => {
    return user?.role_id === 1;
  };

  // Registration function
  const register = async (phone_no: string, password: string) => {
    if (!/^\d{10}$/.test(phone_no)) {
      return { success: false, error: 'Phone number must be 10 digits.' };
    }
    try {
      const response = await fetch(config.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_no, password }),
      });
      if (response.ok) {
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.detail || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAdmin,
      isSuperAdmin,
      register,
      handleTokenExpiration,
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
