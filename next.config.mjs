import path from 'path';
const nextConfig = {
    // ========================================================================
    // URL Handling
    // ========================================================================
    trailingSlash: false,

    // ========================================================================
    // Image Optimization
    // ========================================================================
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**.supabase.co' },
            { protocol: 'https', hostname: '**.supabase.in' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'plus.unsplash.com' },
            { protocol: 'https', hostname: 'ppkofnvuutzdkwxyhwpx.supabase.co' },
            { protocol: 'https', hostname: 'm.media-amazon.com' },
            { protocol: 'https', hostname: 'flaconi.de' }
        ],
        unoptimized: process.env.NODE_ENV === 'development',
    },

    // ========================================================================
    // Redirects (only admin index - other redirects handled by middleware)
    // ========================================================================
    async redirects() {
        return [
            {
                source: '/admin',
                destination: '/admin/dashboard',
                permanent: false,
            },
            {
                source: '/',
                destination: '/ar',
                permanent: true,
            },
        ];
    },

    // Security Headers (P1)
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin'
                    }
                ]
            }
        ];
    },

    // ========================================================================
    // Path Aliases
    // ========================================================================

    // Build Settings
    // ========================================================================
    // ========================================================================
    // Build Settings
    // ========================================================================
    typescript: {
        ignoreBuildErrors: false,
    },
};

export default nextConfig;
