/**
 * Rate Limiting Utility
 * Simple in-memory rate limiter for login attempts
 * For production, consider using Redis or @upstash/ratelimit
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store (Note: This resets on server restart)
// For production, use Redis or Vercel KV
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const MAX_ATTEMPTS = 5;        // Max login attempts
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window

export const rateLimiter = {
    /**
     * Check if the identifier (IP or email) is rate limited
     * Returns { allowed: boolean, remaining: number, resetIn: number }
     */
    check(identifier: string): { allowed: boolean; remaining: number; resetIn: number } {
        const now = Date.now();
        const entry = rateLimitStore.get(identifier);

        // No entry or expired window
        if (!entry || now > entry.resetTime) {
            rateLimitStore.set(identifier, {
                count: 1,
                resetTime: now + WINDOW_MS,
            });
            return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetIn: WINDOW_MS };
        }

        // Probabilistic cleanup (1% chance on every check) to avoid top-level setInterval
        if (Math.random() < 0.01) {
            setTimeout(() => this.cleanup(), 0);
        }

        // Within window
        if (entry.count >= MAX_ATTEMPTS) {
            const resetIn = entry.resetTime - now;
            return { allowed: false, remaining: 0, resetIn };
        }

        // Increment and allow
        entry.count++;
        rateLimitStore.set(identifier, entry);
        return { 
            allowed: true, 
            remaining: MAX_ATTEMPTS - entry.count, 
            resetIn: entry.resetTime - now 
        };
    },

    /**
     * Reset rate limit for an identifier (e.g., after successful login)
     */
    reset(identifier: string): void {
        rateLimitStore.delete(identifier);
    },

    /**
     * Get rate limit status without incrementing
     */
    getStatus(identifier: string): { isLimited: boolean; remaining: number; resetIn: number } {
        const now = Date.now();
        const entry = rateLimitStore.get(identifier);

        if (!entry || now > entry.resetTime) {
            return { isLimited: false, remaining: MAX_ATTEMPTS, resetIn: 0 };
        }

        const isLimited = entry.count >= MAX_ATTEMPTS;
        return { 
            isLimited, 
            remaining: Math.max(0, MAX_ATTEMPTS - entry.count),
            resetIn: entry.resetTime - now 
        };
    },

    /**
     * Cleanup expired entries (call periodically)
     */
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of rateLimitStore.entries()) {
            if (now > entry.resetTime) {
                rateLimitStore.delete(key);
            }
        }
    },
};


