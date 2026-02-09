/**
 * Admin Login API Route with Rate Limiting and Audit Logging
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimiter } from "@/lib/rateLimiter";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "البريد الإلكتروني وكلمة المرور مطلوبين" },
                { status: 400 }
            );
        }

        // Get client IP for rate limiting
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
                   request.headers.get("x-real-ip") || 
                   "unknown";
        
        // Rate limit by IP and email combination
        const identifier = `${ip}:${email.toLowerCase()}`;
        const rateCheck = rateLimiter.check(identifier);

        if (!rateCheck.allowed) {
            const minutesLeft = Math.ceil(rateCheck.resetIn / 60000);
            return NextResponse.json(
                { 
                    error: `تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول. حاول مرة أخرى بعد ${minutesLeft} دقيقة.`,
                    rateLimited: true,
                    resetIn: rateCheck.resetIn 
                },
                { status: 429 }
            );
        }

        // Attempt login
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError || !authData.user) {
            // Log failed attempt (don't await to avoid blocking response)
            console.log(`[Auth] Failed login attempt for: ${email} from IP: ${ip}`);
            
            return NextResponse.json(
                { 
                    error: "بيانات تسجيل الدخول غير صحيحة",
                    remaining: rateCheck.remaining 
                },
                { status: 401 }
            );
        }

        // Check if user is admin
        const role = authData.user.app_metadata?.role;
        if (role !== "admin") {
            // Not an admin - deny access to admin login
            await supabase.auth.signOut();
            return NextResponse.json(
                { error: "ليس لديك صلاحية الوصول للوحة التحكم" },
                { status: 403 }
            );
        }

        // Success - reset rate limit for this identifier
        rateLimiter.reset(identifier);

        // Log successful admin login
        console.log(`[Auth] Admin login successful: ${email} from IP: ${ip}`);

        return NextResponse.json({
            success: true,
            user: {
                id: authData.user.id,
                email: authData.user.email,
                role: role,
            },
            session: authData.session,
        });

    } catch (error: unknown) {
        console.error("[Admin Login] Error:", error);
        return NextResponse.json(
            { error: "حدث خطأ في الخادم" },
            { status: 500 }
        );
    }
}
