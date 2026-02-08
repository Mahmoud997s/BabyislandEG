"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { hydrateSession } = useAuthStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return; // Prevent double submission
        setLoading(true);

        try {
            console.log("Attempting login...");
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.session) {
                // Check if user is admin
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                if (profile?.role !== 'admin') {
                    await supabase.auth.signOut();
                    toast.error("Access denied. Admin privileges required.");
                    return;
                }

                // Sync auth store before redirecting
                await hydrateSession();

                toast.success("Welcome back, Admin!");

                // Small delay to ensure state updates propagate
                setTimeout(() => {
                    router.push("/admin/dashboard");
                }, 100);
            }
        } catch (error: any) {
            console.error("Login Error:", error);
            if (error?.message) console.error("Error Message:", error.message);
            if (error?.code) console.error("Error Code:", error.code);

            // Handle AbortError specifically
            if (error.name === 'AbortError') {
                toast.error("Login request timed out. Please try again.");
            } else {
                toast.error(error.message || "Failed to login");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
                    <p className="text-gray-500 mt-2">Sign in to manage your store</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
                            className="h-11"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="h-11"
                        />
                    </div>
                    <div className="text-right">
                        <a href="/forgot-password" className="text-sm text-[#0EA5E9] hover:text-[#F97316] transition-colors">
                            نسيت كلمة المرور؟
                        </a>
                    </div>

                    <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
