
import { SMART_RULES } from './SmartRules';

export interface ProductInput {
    name: string;
    name_ar?: string;
    description?: string;
    breadcrumbs?: string[];
    url?: string;
    imageUrls?: string[];
}

export interface ClassificationResult {
    category_id: string;
    confidence: number;
    isAmbiguous: boolean;
    allScores: Record<string, number>;
}

export class SmartClassifier {
    
    /**
     * Main Classification Function
     */
    static classify(product: ProductInput): ClassificationResult {
        return this.classifyInternal(product);
    }

    /**
     * Classification with optional Vision AI Fallback
     */
    static async classifyWithVision(product: ProductInput, openAiKey?: string): Promise<ClassificationResult> {
        // 1. Try Local First
        const result = this.classifyInternal(product);

        // 2. If confident, return early
        if (result.confidence >= 10 || !openAiKey) {
            return result;
        }

        // 3. Fallback to Vision AI if URL exists
        const mainImage = Array.isArray(product.imageUrls) ? product.imageUrls[0] : product.url;
        // Only check valid URLs
        if (mainImage && mainImage.startsWith('http')) {
            console.log(`[SmartClassifier] Low confidence (${result.confidence}). Trying Vision AI...`);
            const { VisionAI } = await import('./VisionAI');
            const tags = await VisionAI.analyzeImage(mainImage, openAiKey);
            
            if (tags.length > 0) {
                // 4. Re-classify with new tags appended to description
                console.log(`[SmartClassifier] Vision AI found: ${tags.join(', ')}`);
                const enhancedProduct = {
                    ...product,
                    description: (product.description || '') + ' ' + tags.join(' ')
                };
                return this.classifyInternal(enhancedProduct);
            }
        }

        return result;
    }

    private static classifyInternal(product: ProductInput): ClassificationResult {
        const scores: Record<string, number> = {};

        // 1. Initialize Scores
        Object.keys(SMART_RULES).forEach(key => scores[key] = 0);

        // 2. Prepare Text
        const textToAnalyze = {
            name: `${product.name} ${product.name_ar || ''}`.toLowerCase(),
            desc: (product.description || '').toLowerCase(),
            bread: (product.breadcrumbs || []).join(' ').toLowerCase(),
            url: (product.url || '').toLowerCase()
        };

        // 3. Iterate Rules
        Object.values(SMART_RULES).forEach(rule => {
            let score = 0;

            // A. Check Negative Keywords (Immediate Disqualification or Penalty)
            if (rule.negative) {
                for (const neg of rule.negative) {
                    if (textToAnalyze.name.includes(neg)) {
                        score -= 50; // Huge penalty
                    }
                }
            }

            // B. Check Strong Keywords
            rule.keywords.forEach(word => {
                const w = word.toLowerCase();
                
                // Name match (Weight x 3)
                if (textToAnalyze.name.includes(w)) {
                    score += rule.weight * 3;
                }

                // Breadcrumb match (Weight x 5) - High Trust
                if (textToAnalyze.bread.includes(w)) {
                    score += rule.weight * 5;
                }

                 // URL match (Weight x 2)
                 if (textToAnalyze.url.includes(w)) {
                    score += rule.weight * 2;
                }

                // Image Filename match (Weight x 2) - Tier 1 Vision
                if (Array.isArray(product.imageUrls)) {
                    product.imageUrls.forEach(img => {
                        if (img && img.toLowerCase().includes(w)) {
                             score += rule.weight * 2;
                        }
                    });
                }
            });

            // C. Check Weak Keywords (Description only)
            const weak = rule.weakKeywords || [];
            weak.forEach(word => {
                if (textToAnalyze.desc.includes(word)) {
                    score += 1; // Low value
                }
            });
            
             // Also check main keywords in Description (Weight x 1)
             rule.keywords.forEach(word => {
                 if (textToAnalyze.desc.includes(word.toLowerCase())) {
                     score += rule.weight;
                 }
             });

            scores[rule.id] = score;
        });

        // 4. Determine Winner
        let bestCat = 'uncategorized';
        let maxScore = 0;
        let secondScore = 0;

        Object.entries(scores).forEach(([cat, score]) => {
            if (score > maxScore) {
                secondScore = maxScore;
                maxScore = score;
                bestCat = cat;
            } else if (score > secondScore) {
                secondScore = score;
            }
        });

        // 5. Confidence Logic
        const isAmbiguous = (maxScore - secondScore) < 5 && maxScore > 0; // Close call
        
        // Return result
        // If maxScore is 0 or very low, fallback to 'uncategorized'
        if (maxScore < 5) bestCat = 'uncategorized';

        return {
            category_id: bestCat,
            confidence: maxScore,
            isAmbiguous,
            allScores: scores
        };
    }
}
