// src/store/features/auth/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import { signOut } from 'firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => Promise<void>;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      error: null,
      
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      logout: async () => {
        try {
          await signOut(auth);
          set({ user: null, error: null });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
    }),
    {
      name: 'auth-storage', // unique name for localStorage
      partialize: (state) => ({ user: state.user }), // only persist user data
    }
  )
);
