'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/lib/api-service';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  email: string;
  user_type: 'worker' | 'employer' | 'admin';
  profile: any;
}

interface AuthContextType {
  user: User | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const fetchUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const response = await authService.getUserProfile();
        setUser({
          id: response.profile.user?.id || response.profile.id,
          username: response.profile.user?.username || response.profile.username,
          email: response.profile.user?.email || response.profile.email,
          user_type: response.user_type,
          profile: response.profile
        });
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
      logout();
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      fetchUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: any) => {
    try {
      // This would be used for employer login - we need to implement this
      // For now, just throw an error
      throw new Error('Login not implemented yet');
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      // Register as employer using our auth service
      const response = await authService.registerEmployer({
        username: data.email.split('@')[0], // Generate username from email
        email: data.email,
        password: data.password,
        company_name: data.name,
        phone: data.phone_number,
        sector: data.sector
      });
      
      // Set user data
      await fetchUser();
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/');
  };

  const isAuthenticated = authService.isAuthenticated() && user !== null;
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
    await api.post('auth/register/employer/', data);
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
