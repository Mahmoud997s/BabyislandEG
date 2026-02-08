import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
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
        ];
    },

    // ========================================================================
    // Path Aliases
    // ========================================================================
    webpack: (config) => {
        config.resolve.alias['@'] = path.resolve(__dirname, 'src');
        return config;
    },
    turbopack: {
        resolveAlias: {
            '@/*': ['./src/*'],
        },
    },

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
