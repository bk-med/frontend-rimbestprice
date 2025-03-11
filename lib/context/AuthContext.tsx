'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AuthResponse, login as apiLogin, logout as apiLogout, UserData } from '../api/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  validateToken: () => Promise<boolean>;
  handleAuthFailure: (skipRedirect?: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loginRedirectCount, setLoginRedirectCount] = useState(0); // Prevent redirect loops

  useEffect(() => {
    // Check if we have a token and user in localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user data:', e);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setLoading(false);
  }, []);

  // Function to handle token validation
  const validateToken = async (): Promise<boolean> => {
    // Don't attempt to validate if we're already refreshing or don't have a token
    if (isRefreshing || !token) {
      return false;
    }

    // Set refreshing flag to prevent multiple concurrent validations
    setIsRefreshing(true);
    
    try {
      // This would ideally be a call to check token validity
      // For now, we'll just check if the token exists
      const isValid = !!token;
      setIsRefreshing(false);
      return isValid;
    } catch (error) {
      console.error('Token validation error:', error);
      // If validation fails, clear token
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsRefreshing(false);
      return false;
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    
    try {
      const response = await apiLogin({ username, password });
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      const userData: UserData = {
        id: response.id,
        username: response.username,
        email: response.email,
        role: response.role
      };
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(response.token);
      setUser(userData);
      // Reset the redirect counter on successful login
      setLoginRedirectCount(0);
      return true; // Indicate success
    } catch (error) {
      console.error('Login error', error);
      // Clear any existing token to be safe
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      apiLogout();
    } catch (e) {
      console.error('Logout API error:', e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setLoginRedirectCount(0);
  };

  // Handler for authentication failures
  const handleAuthFailure = (skipRedirect: boolean = false) => {
    console.log('Authentication failed, handling failure...');
    
    // Clear user data and token
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Skip redirection if requested (for special cases like booking cancellation)
    if (skipRedirect) {
      console.log('Skipping redirect to login page as requested');
      return;
    }

    // Increment redirect counter
    setLoginRedirectCount(prev => prev + 1);
    
    if (loginRedirectCount < 3) {
      console.log('Redirecting to login page...');
      // Don't call logout here since we've already cleared the tokens above
      router.push('/login');
    } else {
      console.log('Too many redirect attempts, stopping redirect loop');
      // Reset counter after a delay
      setTimeout(() => setLoginRedirectCount(0), 5000);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    loading,
    validateToken,
    handleAuthFailure
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 