import { create } from 'zustand';
import { tokenStore } from '../lib/api';
import { clearCandidateRecord } from '../lib/localRecord';

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
    // Sign-out clears this candidate's work from the device. Until 29 August
    // 2026 it cleared only the token, so the next person to sign in on the
    // same browser inherited the previous one's plan, sittings and entered
    // score reports. See `lib/localRecord.ts`.
    clearCandidateRecord();
    set({ user: null, isAuthenticated: false });
  },
}));
