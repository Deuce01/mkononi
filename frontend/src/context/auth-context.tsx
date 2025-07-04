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
      // Login as employer using our auth service
      const response = await authService.loginEmployer(data.email, data.password);
      
      // Set user data
      await fetchUser();
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
        company_name: data.company_name,
        phone: data.phone,
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

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isLoading,
      isAuthenticated
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
