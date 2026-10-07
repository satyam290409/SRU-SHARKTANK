import { create } from 'zustand';
import type { AuthUser } from '@/types';
import { api } from '@/lib/api';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (role: 'admin' | 'participant' | 'voter', credentials: Record<string, string>) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (role, credentials) => {
    let result;
    
    switch (role) {
      case 'admin':
        result = await api.adminLogin(credentials.email, credentials.password);
        break;
      case 'participant':
        result = await api.participantLogin(credentials.name, credentials.enrollmentNumber, credentials.password);
        break;
      case 'voter':
        result = await api.voterLogin(credentials.name, credentials.enrollmentNumber, credentials.password);
        break;
    }

    if (result.success && result.data) {
      const user = result.data as AuthUser;
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    }

    return { success: false, error: result.error || 'Login failed' };
  },

  logout: async () => {
    await api.logout();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    const result = await api.getMe();
    if (result.success && result.data) {
      const user = result.data as AuthUser;
      set({ user, isAuthenticated: true, isLoading: false });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
