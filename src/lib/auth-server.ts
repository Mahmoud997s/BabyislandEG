import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Enforce Admin Role checking on the server.
 * Returns the user if authenticated and admin.
 * Redirects or throws otherwise.
 */
export async function requireAdmin() {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/admin/login");
    }

    // Check Role
    // Fetch role from profiles table
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        // Log them out or redirect to unauthorized
        // For now, redirect to login
        redirect("/admin/login");
    }

    return user;
}
