import { create } from 'zustand';

// Define the structure of the auth state
interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; name: string; email: string } | null;
  login: (userData: { id: string; name: string; email: string }) => void;
  logout: () => void;
}

// Create the Zustand store for authentication
const useAuthStore = create<AuthState>((set: (arg0: { isAuthenticated: boolean; user: any; }) => any) => ({
  isAuthenticated: false,
  user: null,
  login: (userData: any) => set({ isAuthenticated: true, user: userData }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));

export default useAuthStore;
