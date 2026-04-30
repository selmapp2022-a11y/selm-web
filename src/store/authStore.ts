import { create } from 'zustand';
import { tokenStore } from '../lib/api';

export type User = {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  current_level?: string;
  onboarding_completed?: boolean;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!tokenStore.get(),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    tokenStore.clear();
    set({ user: null, isAuthenticated: false });
  },
}));
