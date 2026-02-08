
import { createClient } from '@supabase/supabase-js';

async function fetchWithRetry(url: string, retries = 3) {
    console.log(`Fetching: ${url}`);
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); 
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                const text = await response.text();
                // console.log("Response length:", text.length);
                return text;
            }
            throw new Error(`Status ${response.status}`);
        } catch (e: any) {
            console.log(`  Retry ${i+1}/${retries} error: ${e.message}`);
            await new Promise(r => setTimeout(r, 2000 * (i + 1)));
        }
    }
    return null;
}

async function scrapeImage(url: string) {
    try {
        const html = await fetchWithRetry(url);
        // patterns
        const patterns = [
            /data-old-hires="([^"]+)"/,
            /data-a-dynamic-image="([^"]+)"/,
            /"large":"([^"]+)"/
        ];
        for (const pattern of patterns) {
            const match = html && html.match(pattern);
            if (match && match[1]) {
                let imgUrl = match[1];
                if (imgUrl.startsWith('{')) {
                    try {
                        const json = JSON.parse(imgUrl.replace(/&quot;/g, '"'));
                        imgUrl = Object.keys(json)[0];
                    } catch (e) {
                         const urlMatch = imgUrl.match(/(https?:\/\/[^"]+)/);
                         if (urlMatch) imgUrl = urlMatch[1];
                    }
                }
                return imgUrl;
            }
        }
        return null; // No fallback
    } catch (e) {
        return null;
    }
}

async function run() {
    const url = "https://www.amazon.eg/-/en/Junior-Baby-Beanie-Set-Months/dp/B0DVGMX8JS";
    console.log(`Testing scrape for: ${url}`);
    const img = await scrapeImage(url);
    console.log(`Result: ${img}`);
}

run();
