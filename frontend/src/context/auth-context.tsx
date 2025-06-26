'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  email: string;
  name: string; // Assuming the user object has a name
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const fetchUser = async (userToken: string) => {
    try {
      api.defaults.headers.Authorization = `Bearer ${userToken}`;
      // Assuming an endpoint to get user details
      const response = await api.get('/auth/user/'); 
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user", error);
      logout(); // If we can't fetch the user, the token is likely invalid
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: any) => {
    const response = await api.post('/auth/token/', data);
    const { access, refresh } = response.data;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    setToken(access);
    await fetchUser(access);
  };

  const register = async (data: any) => {
    // Assuming a registration endpoint
    await api.post('/auth/register/', data);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete api.defaults.headers.Authorization;
    
    // Only show toast if not already on a public page
    if (pathname.includes('/dashboard')) {
       toast({
        title: "Logged out",
        description: "You have been successfully logged out."
       });
    }
    router.push('/employer/login');
  };
  
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, isAuthenticated }}>
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
