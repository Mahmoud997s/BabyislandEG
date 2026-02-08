/**
 * Amazon Scraper
 * Extracts price and stock information from Amazon product pages
 * 
 * NOTE: Amazon has strong anti-scraping measures.
 * For production, consider using:
 * - Amazon Product Advertising API
 * - Rainforest API
 * - ScraperAPI with rotating proxies
 */

import { BaseScraper, ScrapedProduct, ScraperOptions } from './baseScraper';

export class AmazonScraper extends BaseScraper {
    constructor(options: ScraperOptions = {}) {
        super('amazon', options);
    }

    isValidUrl(url: string): boolean {
        try {
            const hostname = new URL(url).hostname.toLowerCase();
            return hostname.includes('amazon.');
        } catch {
            return false;
        }
    }

    async scrape(url: string): Promise<ScrapedProduct> {
        try {
            const html = await this.fetchWithRetry(url);
            return this.parseHtml(html);
        } catch (error) {
            console.error('[AmazonScraper] Error:', error);
            throw error;
        }
    }

    private parseHtml(html: string): ScrapedProduct {
        // Price selectors (Amazon uses multiple formats)
        const pricePatterns = [
            /<span[^>]*id="priceblock_ourprice"[^>]*>([^<]+)</,
            /<span[^>]*id="priceblock_dealprice"[^>]*>([^<]+)</,
            /<span[^>]*class="[^"]*a-price-whole[^"]*"[^>]*>([^<]+)</,
            /<span[^>]*class="[^"]*apexPriceToPay[^"]*"[^>]*>[\s\S]*?<span[^>]*>([^<]+)</,
            /data-a-color="price"[^>]*>[\s\S]*?<span[^>]*>([^<]+)</,
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
            /<span[^>]*class="[^"]*a-text-price[^"]*"[^>]*>[\s\S]*?<span[^>]*>([^<]+)</,
            /<span[^>]*id="priceblock_saleprice"[^>]*>([^<]+)</,
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
        const inStockPatterns = [
            /id="availability"[^>]*>[\s\S]*?(in stock|متوفر|متاح)/i,
            /id="add-to-cart-button"/i,
            /id="buy-now-button"/i,
        ];

        const outOfStockPatterns = [
            /currently unavailable/i,
            /out of stock/i,
            /غير متوفر/i,
        ];

        let inStock = false;
        for (const pattern of inStockPatterns) {
            if (pattern.test(html)) {
                inStock = true;
                break;
            }
        }

        for (const pattern of outOfStockPatterns) {
            if (pattern.test(html)) {
                inStock = false;
                break;
            }
        }

        // Title
        const titleMatch = html.match(/<span[^>]*id="productTitle"[^>]*>([^<]+)</);
        const title = titleMatch ? titleMatch[1].trim() : undefined;

        // Main image
        const imageMatch = html.match(/data-old-hires="([^"]+)"/);
        const imageUrl = imageMatch ? imageMatch[1] : undefined;

        // Currency detection
        let currency = 'EGP';
        if (html.includes('$') || html.includes('USD')) currency = 'USD';
        if (html.includes('€') || html.includes('EUR')) currency = 'EUR';
        if (html.includes('ج.م') || html.includes('EGP')) currency = 'EGP';

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
