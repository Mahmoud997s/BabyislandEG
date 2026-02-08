/**
 * Base Scraper Interface
 * All platform-specific scrapers must implement this interface
 */

export interface ScrapedProduct {
    price: number | null;
    originalPrice?: number | null;
    currency: string;
    inStock: boolean;
    stockQuantity?: number;
    title?: string;
    imageUrl?: string;
    lastUpdated: Date;
}

export interface ScraperOptions {
    timeout?: number;
    retries?: number;
    userAgent?: string;
}

export abstract class BaseScraper {
    protected platform: string;
    protected options: ScraperOptions;

    constructor(platform: string, options: ScraperOptions = {}) {
        this.platform = platform;
        this.options = {
            timeout: options.timeout || 10000,
            retries: options.retries || 3,
            userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        };
    }

    abstract scrape(url: string): Promise<ScrapedProduct>;

    abstract isValidUrl(url: string): boolean;

    protected async fetchWithRetry(url: string): Promise<string> {
        let lastError: Error | null = null;

        for (let i = 0; i < (this.options.retries || 3); i++) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': this.options.userAgent || '',
                        'Accept': 'text/html,application/xhtml+xml',
                        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
                    },
                    signal: AbortSignal.timeout(this.options.timeout || 10000),
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.text();
            } catch (error) {
                lastError = error as Error;
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }

        throw lastError || new Error('Failed to fetch after retries');
    }

    protected extractNumber(text: string): number | null {
        // Remove currency symbols and extract number
        const cleaned = text.replace(/[^\d.,]/g, '').replace(',', '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? null : num;
    }
}

/**
 * Scraper Factory
 * Returns the appropriate scraper based on URL
 */
export class ScraperFactory {
    private static scrapers: Map<string, BaseScraper> = new Map();

    static registerScraper(platform: string, scraper: BaseScraper): void {
        this.scrapers.set(platform.toLowerCase(), scraper);
    }

    static getScraper(url: string): BaseScraper | null {
        for (const [_, scraper] of this.scrapers) {
            if (scraper.isValidUrl(url)) {
                return scraper;
            }
        }
        return null;
    }

    static getPlatformFromUrl(url: string): string | null {
        try {
            const hostname = new URL(url).hostname.toLowerCase();
            if (hostname.includes('amazon')) return 'amazon';
            if (hostname.includes('noon')) return 'noon';
            if (hostname.includes('jumia')) return 'jumia';
            return null;
        } catch {
            return null;
        }
    }
}
