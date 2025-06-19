
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'admin';
  department: string;
  position: string;
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
