/**
 * Jumia Scraper
 * Extracts price and stock information from Jumia product pages
 */

import { BaseScraper, ScrapedProduct, ScraperOptions } from './baseScraper';

export class JumiaScraper extends BaseScraper {
    constructor(options: ScraperOptions = {}) {
        super('jumia', options);
    }

    isValidUrl(url: string): boolean {
        try {
            const hostname = new URL(url).hostname.toLowerCase();
            return hostname.includes('jumia.');
        } catch {
            return false;
        }
    }

    async scrape(url: string): Promise<ScrapedProduct> {
        try {
            const html = await this.fetchWithRetry(url);
            return this.parseHtml(html);
        } catch (error) {
            console.error('[JumiaScraper] Error:', error);
            throw error;
        }
    }

    private parseHtml(html: string): ScrapedProduct {
        // Jumia price patterns
        const pricePatterns = [
            /class="-b -ubpt -tal -fs24 -prxs"[^>]*>[\s\S]*?(\d[\d,.]+)/,
            /class="price[^"]*"[^>]*>[\s\S]*?(\d[\d,.]+)/,
            /"price":\s*"?(\d[\d,.]+)/,
            /itemprop="price"[^>]*content="(\d[\d,.]+)"/,
            /-fs24[^>]*>[\s\S]*?EGP[\s]*(\d[\d,.]+)/,
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
            /class="-tal -gy5 -lthr -fs14 -pvxs"[^>]*>[\s\S]*?(\d[\d,.]+)/,
            /class="oldPrice[^"]*"[^>]*>[\s\S]*?(\d[\d,.]+)/,
            /-lthr[^>]*>[\s\S]*?EGP[\s]*(\d[\d,.]+)/,
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
            /class="out">/i,
            /-out/i,
        ];

        let inStock = true;
        for (const pattern of outOfStockPatterns) {
            if (pattern.test(html)) {
                inStock = false;
                break;
            }
        }

        // Title
        const titleMatch = html.match(/<h1[^>]*class="-fs20[^"]*"[^>]*>([^<]+)</);
        const title = titleMatch ? titleMatch[1].trim() : undefined;

        // Image
        const imageMatch = html.match(/og:image"[^>]*content="([^"]+)"/);
        const imageUrl = imageMatch ? imageMatch[1] : undefined;

        // Currency (Jumia Egypt uses EGP)
        const currency = 'EGP';

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
