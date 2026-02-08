/**
 * Noon Scraper
 * Extracts price and stock information from Noon product pages
 */

import { BaseScraper, ScrapedProduct, ScraperOptions } from './baseScraper';

export class NoonScraper extends BaseScraper {
    constructor(options: ScraperOptions = {}) {
        super('noon', options);
    }

    isValidUrl(url: string): boolean {
        try {
            const hostname = new URL(url).hostname.toLowerCase();
            return hostname.includes('noon.com');
        } catch {
            return false;
        }
    }

    async scrape(url: string): Promise<ScrapedProduct> {
        try {
            const html = await this.fetchWithRetry(url);
            return this.parseHtml(html);
        } catch (error) {
            console.error('[NoonScraper] Error:', error);
            throw error;
        }
    }

    private parseHtml(html: string): ScrapedProduct {
        // Noon price patterns
        const pricePatterns = [
            /data-qa="price-now"[^>]*>[\s\S]*?(\d[\d,.]+)/,
            /"price":\s*"?(\d[\d,.]+)/,
            /class="priceNow[^"]*"[^>]*>[\s\S]*?(\d[\d,.]+)/,
            /class="sellingPrice[^"]*"[^>]*>[\s\S]*?(\d[\d,.]+)/,
        ];

        let price: number | null = null;
        for (const pattern of pricePatterns) {
            const match = html.match(pattern);
            if (match) {
                price = this.extractNumber(match[1]);
                if (price) break;
            }
        }

        // Original price (for discounts)
        const originalPricePatterns = [
            /data-qa="price-was"[^>]*>[\s\S]*?(\d[\d,.]+)/,
            /"was":\s*"?(\d[\d,.]+)/,
            /class="priceWas[^"]*"[^>]*>[\s\S]*?(\d[\d,.]+)/,
        ];

        let originalPrice: number | null = null;
        for (const pattern of originalPricePatterns) {
            const match = html.match(pattern);
            if (match) {
                originalPrice = this.extractNumber(match[1]);
                if (originalPrice) break;
            }
        }

        // Stock status
        const outOfStockPatterns = [
            /out of stock/i,
            /sold out/i,
            /غير متوفر/i,
            /نفذت الكمية/i,
        ];

        let inStock = true;
        for (const pattern of outOfStockPatterns) {
            if (pattern.test(html)) {
                inStock = false;
                break;
            }
        }

        // Title
        const titleMatch = html.match(/<h1[^>]*>([^<]+)</);
        const title = titleMatch ? titleMatch[1].trim() : undefined;

        // Image
        const imageMatch = html.match(/og:image"[^>]*content="([^"]+)"/);
        const imageUrl = imageMatch ? imageMatch[1] : undefined;

        // Currency (Noon Egypt uses EGP)
        let currency = 'EGP';
        if (html.includes('AED') || html.includes('درهم')) currency = 'AED';
        if (html.includes('SAR') || html.includes('ريال')) currency = 'SAR';

        return {
            price,
            originalPrice,
            currency,
            inStock,
            title,
            imageUrl,
            lastUpdated: new Date(),
        };
    }
}
