import { MetadataRoute } from 'next';
// import { productsServiceServer } from '../src/services/productsService.server';
// import { Product } from '../src/data/products';

const baseUrl = 'https://babyislandeg.com';

const staticRoutes = [
    '',
    '/shop',
    '/about-us',
    '/contactus',
    '/blog',
    '/store-locations',
].flatMap((route) => [
    {
        url: `${baseUrl}/en${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1.0 : 0.5,
    },
    {
        url: `${baseUrl}/ar${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1.0 : 0.5,
    },
]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Build-time protection: If env vars are missing OR we are building, return only static routes
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.IS_BUILD === 'true') {
      return staticRoutes;
  }
  // Static sitemap for stability
  // Dynamic products generation temporarily disabled pending build environment fix
  return [...staticRoutes];
}
