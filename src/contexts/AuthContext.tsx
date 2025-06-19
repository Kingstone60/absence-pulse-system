
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, RegisterData } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: 'employee' | 'admin') => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: (User & { password: string })[] = [
  {
    id: 'admin1',
    email: 'admin@entreprise.fr',
    password: 'admin123',
    name: 'Marie Lefebvre',
    role: 'admin',
    department: 'RH',
    position: 'Responsable RH'
  },
  {
    id: 'emp1',
    email: 'sophie.martin@entreprise.fr',
    password: 'emp123',
    name: 'Sophie Martin',
    role: 'employee',
    department: 'Développement',
    position: 'Développeuse Senior'
  },
  {
    id: 'emp2',
    email: 'pierre.dubois@entreprise.fr',
    password: 'emp123',
    name: 'Pierre Dubois',
    role: 'employee',
    department: 'Marketing',
    position: 'Chef de Projet'
  }
];

// Store users in localStorage to persist registrations
const getUsersFromStorage = () => {
  const stored = localStorage.getItem('mockUsers');
  return stored ? JSON.parse(stored) : mockUsers;
};

const saveUsersToStorage = (users: (User & { password: string })[]) => {
  localStorage.setItem('mockUsers', JSON.stringify(users));
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'employee' | 'admin'): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = getUsersFromStorage();
    const foundUser = users.find(
      u => u.email === email && u.password === password && u.role === role
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = getUsersFromStorage();
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === data.email);
    if (existingUser) {
      setIsLoading(false);
      return false;
    }
    
    // Create new user
    const newUser = {
      id: `emp_${Date.now()}`,
      email: data.email,
      password: data.password,
      name: data.name,
      role: 'employee' as const,
      department: data.department,
      position: data.position
    };
    
    const updatedUsers = [...users, newUser];
    saveUsersToStorage(updatedUsers);
    
    // Auto login the new user
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    
    setIsLoading(false);
    return true;
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = getUsersFromStorage();
    const updatedUsers = users.map(u => 
      u.id === user.id 
        ? { ...u, ...data }
        : u
    );
    
    saveUsersToStorage(updatedUsers);
    
    // Update current user
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    updateProfile,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
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
