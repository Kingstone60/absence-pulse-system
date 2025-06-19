
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'admin';
  position: string;
  department: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: 'employee' | 'admin';
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  position: string;
  department: string;
}
