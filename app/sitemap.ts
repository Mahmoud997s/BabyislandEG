import { MetadataRoute } from 'next';
import { productsService } from '../src/services/productsService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await productsService.getAllProducts(); // Fetch all products
  const baseUrl = 'https://babyislandeg.com';

  const productUrls = products.flatMap((product) => {
    return [
      {
        url: `${baseUrl}/en/product/${product.id}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/ar/product/${product.id}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
    ];
  });

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

  return [...staticRoutes, ...productUrls];
}
