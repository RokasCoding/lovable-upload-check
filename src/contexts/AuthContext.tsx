
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '../types';
import { useToast } from '@/hooks/use-toast';
import { mockUsers } from '../data/mockData';

type AuthContextType = {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  setDemoUser: (userType: 'admin' | 'user') => void;
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => false,
  logout: () => {},
  register: async () => false,
  forgotPassword: async () => false,
  verifyEmail: async () => false,
  setDemoUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Check if this is a test user
      const testUser = mockUsers.find(user => user.email === email);
      
      if (testUser && password === 'password123') {
        setCurrentUser(testUser);
        localStorage.setItem('currentUser', JSON.stringify(testUser));
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${testUser.name}!`,
        });
        
        setIsLoading(false);
        return true;
      }
      
      // For other emails, simulate a real login check
      if (email && password) {
        // Create a new user for demo purposes
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0],
          email,
          role: 'user',
          totalPoints: 0,
          isVerified: true,
        };
        
        setCurrentUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        toast({
          title: "Login Successful",
          description: `Welcome, ${newUser.name}!`,
        });
        
        setIsLoading(false);
        return true;
      }
      
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      });
      
      setIsLoading(false);
      return false;
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Failed to login, please try again",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const setDemoUser = (userType: 'admin' | 'user') => {
    setIsLoading(true);
    try {
      const demoUser: User = {
        id: `demo-${userType}-${Date.now()}`,
        name: userType === 'admin' ? 'Demo Admin' : 'Demo User',
        email: userType === 'admin' ? 'admin@example.com' : 'user@example.com',
        role: userType,
        totalPoints: userType === 'admin' ? 999 : 100,
        isVerified: true,
      };
      
      setCurrentUser(demoUser);
      localStorage.setItem('currentUser', JSON.stringify(demoUser));
      
      toast({
        title: "Demo Login",
        description: `You are now logged in as a demo ${userType}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, name: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate registration
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: 'user',
        totalPoints: 0,
        isVerified: true,
      };
      
      toast({
        title: "Success",
        description: "Registration successful! You can now log in.",
      });
      
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: "Failed to register, please try again",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      toast({
        title: "Success",
        description: "If your email is registered, you will receive password reset instructions",
      });
      return true;
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast({
        title: "Error",
        description: "Failed to process request, please try again",
        variant: "destructive",
      });
      return false;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      toast({
        title: "Success",
        description: "Email verified successfully! You can now log in.",
      });
      return true;
    } catch (error: any) {
      console.error("Email verification error:", error);
      toast({
        title: "Error",
        description: "Failed to verify email, please try again",
        variant: "destructive",
      });
      return false;
    }
  };

  const value = {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    login,
    logout,
    register,
    forgotPassword,
    verifyEmail,
    setDemoUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
