/**
 * Auth Store - Zustand store for authentication state
 */
import { create } from 'zustand';
import { authService, type Session } from '@/services/authService';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'customer' | 'admin';
    is_banned?: boolean;
}

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    register: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    hydrateSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    register: async (data) => {
        const result = await authService.register(data);

        if (result.success && result.user) {
            // Auto login after registration
            const loginResult = await authService.login({ email: data.email, password: data.password });

            if (loginResult.success && loginResult.user) {
                set({
                    user: loginResult.user as AuthUser,
                    isAuthenticated: true,
                });
            }
        }

        return { success: result.success, error: result.error };
    },

    login: async (email, password) => {
        const result = await authService.login({ email, password });

        if (result.success && result.user) {
            // Check if user is banned
            const user = result.user as unknown as AuthUser;
            if (user.is_banned) {
                await authService.logout();
                return { success: false, error: 'BANNED_USER' };
            }

            set({
                user: user,
                isAuthenticated: true,
            });
        }

        return { success: result.success, error: result.error };
    },

    logout: async () => {
        await authService.logout();
        set({
            user: null,
            isAuthenticated: false,
        });
    },

    hydrateSession: async () => {
        if (typeof window === 'undefined') {
            set({ isLoading: false });
            return;
        }

        const session = await authService.getSession();

        if (session?.user) {
            const user = session.user as AuthUser;

            if (user.is_banned) {
                await authService.logout();
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
                return;
            }

            set({
                user: user,
                isAuthenticated: true,
                isLoading: false,
            });
        } else {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    },
}));

// Hydrate session on load
if (typeof window !== 'undefined') {
    // Use setTimeout to avoid SSR issues
    setTimeout(() => {
        useAuthStore.getState().hydrateSession();
    }, 0);
}
