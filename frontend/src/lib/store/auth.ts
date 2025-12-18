import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: 'qr-health-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Demo users for development
// Note: Using the new UserRole types that include clinic_admin and super_admin
export const DEMO_USERS: Record<UserRole, User> = {
  patient: {
    id: 'demo-patient-1',
    email: 'patient@qrhealth.demo',
    name: 'John Smith',
    role: 'patient',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    consentGiven: true,
    consentDate: new Date().toISOString(),
  },
  family_viewer: {
    id: 'demo-family-1',
    email: 'family@qrhealth.demo',
    name: 'Jane Smith',
    role: 'family_viewer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    consentGiven: true,
    consentDate: new Date().toISOString(),
  },
  doctor: {
    id: 'demo-doctor-1',
    email: 'doctor@qrhealth.demo',
    name: 'Dr. Sarah Johnson',
    role: 'doctor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    consentGiven: true,
    consentDate: new Date().toISOString(),
  },
  clinic_admin: {
    id: 'demo-clinic-admin-1',
    email: 'admin@qrhealth.demo',
    name: 'Clinic Admin',
    role: 'clinic_admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    consentGiven: true,
    consentDate: new Date().toISOString(),
  },
  super_admin: {
    id: 'demo-super-admin-1',
    email: 'superadmin@qrhealth.demo',
    name: 'Super Admin',
    role: 'super_admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    consentGiven: true,
    consentDate: new Date().toISOString(),
  },
};
