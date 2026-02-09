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
    // We prioritize metadata for speed and reliability
    const metadataRole = user.user_metadata?.role;
    if (metadataRole === "admin") {
        return user;
    }

    // Fallback/Secondary verification via DB
    try {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role === "admin") {
            return user;
        }
    } catch (e) {
        console.error("Server-side profile lookup failed:", e);
    }

    // Not an admin -> redirect
    redirect("/admin/login");

    return user;
}
