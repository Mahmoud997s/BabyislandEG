/**
 * Rate Limiting Utility
 * Simple in-memory rate limiter for serverless environments.
 * Note: Memory state is not shared between serverless function invocations (lambdas),
 * so effectiveness depends on the runtime environment (Vercel uses shared memory for edge/serverless to some extent, but it's not guaranteed).
 * For strict distributed rate limiting, use Redis (e.g., Upstash).
 */

interface RateLimitConfig {
    limit: number;      // Max requests
    windowMs: number;   // Time window in milliseconds
}

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

class MemoryRateLimiter {
    private store = new Map<string, RateLimitEntry>();
    private config: RateLimitConfig;

    constructor(config: RateLimitConfig) {
        this.config = config;
    }

    /**
     * Check if the identifier is rate limited
     */
    check(identifier: string): { allowed: boolean; remaining: number; resetIn: number } {
        const now = Date.now();
        const entry = this.store.get(identifier);

        // cleanup probabilistically
        if (Math.random() < 0.05) this.cleanup();

        // New or expired entry
        if (!entry || now > entry.resetTime) {
            this.store.set(identifier, {
                count: 1,
                resetTime: now + this.config.windowMs,
            });
            return { 
                allowed: true, 
                remaining: this.config.limit - 1, 
                resetIn: this.config.windowMs 
            };
        }

        // Existing entry
        if (entry.count >= this.config.limit) {
            return { 
                allowed: false, 
                remaining: 0, 
                resetIn: entry.resetTime - now 
            };
        }

        entry.count++;
        return { 
            allowed: true, 
            remaining: this.config.limit - entry.count, 
            resetIn: entry.resetTime - now 
        };
    }

    /**
     * Reset rate limit for an identifier
     */
    reset(identifier: string): void {
        this.store.delete(identifier);
    }

    /**
     * Cleanup expired entries
     */
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (now > entry.resetTime) {
                this.store.delete(key);
            }
        }
    }
}

// 1. Strict Login Limiter: 5 attempts / 15 mins
export const loginRateLimiter = new MemoryRateLimiter({
    limit: 5,
    windowMs: 15 * 60 * 1000
});

// 2. Generic API Limiter: 60 requests / 1 min (e.g. for search endpoints)
export const apiRateLimiter = new MemoryRateLimiter({
    limit: 60,
    windowMs: 60 * 1000
});

// Export default for backward compatibility if needed, aliased to login
export const rateLimiter = loginRateLimiter; 



