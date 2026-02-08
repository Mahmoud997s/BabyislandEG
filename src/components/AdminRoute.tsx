"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocaleNavigate } from "@/hooks/useLocaleNavigate";
import { useAuthStore } from "@/store/authStore";

interface AdminRouteProps {
    children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuthStore();
    const pathname = usePathname();
    const navigate = useLocaleNavigate();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                navigate("/login", { replace: true });
            } else if (user?.role !== "admin") {
                navigate("/account", { replace: true });
            }
        }
    }, [isAuthenticated, isLoading, user, navigate]);

    // Show nothing while loading session
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Show loading while redirecting
    if (!isAuthenticated || user?.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return <>{children}</>;
}
