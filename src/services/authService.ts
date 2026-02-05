/**
 * Auth Service - Supabase Authentication
 */
import { supabase } from '@/lib/supabase';

// Types
export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'customer' | 'admin';
}

export interface Session {
    userId: string;
    user: User;
    createdAt: number;
}

export interface RegisterData {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export const authService = {
    /**
     * Register a new user with Supabase
     */
    async register(data: RegisterData): Promise<{ success: boolean; error?: string; user?: User }> {
        try {
            // Sign up with Supabase Auth
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        name: data.name,
                        phone: data.phone,
                        role: 'customer'
                    }
                }
            });

            if (signUpError) {
                console.error('Signup error:', signUpError);
                if (signUpError.message.includes('already registered')) {
                    return { success: false, error: 'EMAIL_EXISTS' };
                }
                return { success: false, error: signUpError.message };
            }

            if (!authData.user) {
                return { success: false, error: 'Registration failed' };
            }

            // Create user profile in database
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: authData.user.id,
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                        role: 'customer'
                    }
                ]);

            if (profileError) {
                console.error('Profile creation error:', profileError);
                // Continue anyway, profile might already exist
            }

            const user: User = {
                id: authData.user.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                role: 'customer'
            };

            return { success: true, user };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Registration failed' };
        }
    },

    /**
     * Login user with Supabase
     */
    async login(data: LoginData): Promise<{ success: boolean; error?: string; user?: User }> {
        try {
            const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (signInError) {
                console.error('Login error:', signInError);
                return { success: false, error: 'INVALID_CREDENTIALS' };
            }

            if (!authData.user) {
                return { success: false, error: 'Login failed' };
            }

            // Get user profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            const user: User = {
                id: authData.user.id,
                name: profile?.name || authData.user.user_metadata?.name || 'User',
                email: authData.user.email || data.email,
                phone: profile?.phone || authData.user.user_metadata?.phone || '',
                role: profile?.role || authData.user.user_metadata?.role || 'customer'
            };

            return { success: true, user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Login failed' };
        }
    },

    /**
     * Logout - clear Supabase session
     */
    async logout(): Promise<void> {
        await supabase.auth.signOut();
    },

    /**
     * Get current session from Supabase
     */
    async getSession(): Promise<Session | null> {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) {
                return null;
            }

            // Get user profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            const user: User = {
                id: session.user.id,
                name: profile?.name || session.user.user_metadata?.name || 'User',
                email: session.user.email || '',
                phone: profile?.phone || session.user.user_metadata?.phone || '',
                role: profile?.role || session.user.user_metadata?.role || 'customer'
            };

            return {
                userId: session.user.id,
                user,
                createdAt: new Date(session.user.created_at).getTime()
            };
        } catch (error) {
            console.error('Get session error:', error);
            return null;
        }
    },

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        const session = await this.getSession();
        return session !== null;
    },

    /**
     * Check if current user is admin
     */
    async isAdmin(): Promise<boolean> {
        const session = await this.getSession();
        return session?.user?.role === 'admin';
    },
};
