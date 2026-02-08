
export class VisionAI {
    /**
     * Analyze image using OpenAI Vision API
     * @param imageUrl 
     * @param openAiKey 
     * @returns List of tags
     */
    static async analyzeImage(imageUrl: string, openAiKey?: string): Promise<string[]> {
        if (!openAiKey) {
            console.warn('VisionAI: No API Key provided via OPENAI_API_KEY');
            return [];
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openAiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: "Analyze this product image. Return a JSON array of up to 5 simple lowercase English keywords describing the product category (e.g. ['stroller', 'diaper', 'toy', 'clothing']). Do not return sentences." },
                                { type: "image_url", image_url: { url: imageUrl } }
                            ]
                        }
                    ],
                    max_tokens: 50
                })
            });

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            
            if (!content) return [];

            // Parse JSON array from string
            // It usually returns ```json ["tag"] ``` or just ["tag"]
            const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                const tags = JSON.parse(cleanContent);
                return Array.isArray(tags) ? tags : [];
            } catch (e) {
                console.error('VisionAI Parse Error:', e);
                return [];
            }

        } catch (error) {
            console.error('VisionAI Error:', error);
            return [];
        }
    }
}
