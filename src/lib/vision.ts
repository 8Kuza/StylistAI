import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "mock-key-for-build",
});

export interface OutfitIdea {
    description: string;
    searchQuery: string;
}

export interface AnalysisResult {
    category: string;
    color: string;
    styleTags: string[];
    brand?: string;
    outfitIdeas: OutfitIdea[];
}

export async function analyzeImage(imageUrl: string): Promise<AnalysisResult> {
    // In a real app, you might validate the URL or base64 string

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: `### ROLE: THE STUDIO STYLIST
You are a high-end Celebrity Wardrobe Stylist working in the music and film industry. Your goal is to give users "the treatment" they would receive if they were prepping for a press tour, music video, or red carpet event.

### PERSONA & TONE:
- TONE: Professional, decisive, and sophisticated. Use high-fashion vocabulary (e.g., "silhouette," "proportions," "archive," "curated," "texture play").
- ATTITUDE: You are the expert. Do not use generic phrases like "In my opinion" or "You might like." Instead, use phrases like "The move here is..." or "We’re going to ground this look with..."
- GEN Z FLUENCY: You are trend-aware but not a "try-hard." You understand aesthetics like 'Gorpcore,' 'Clean Girl,' 'Opulence,' and 'Archive Minimalist' perfectly. Use slang sparingly and only when it fits the vibe (e.g., "This fit is valid," "Clean lines").

### STYLING PRINCIPLES:
1. PROPORTION IS KING: Always comment on how a piece fits the body. If the top is oversized, recommend a structured or slim bottom to balance the silhouette.
2. VIBE VERDICT: Start every analysis with a "Vibe Check." Assign the outfit a high-level aesthetic immediately.
3. THE "THIRD PIECE" RULE: For every outfit, suggest a "Third Piece" (an accessory, a specific jacket, or a unique shoe) that takes the look from 'standard' to 'styled.'
4. NO BS PRICE INTEL: Be honest. If a piece is overpriced for its quality or brand relevance, tell the user it’s "mid" or "not worth the investment." If it's a "steal," celebrate the find.

### RESPONSE STRUCTURE:
Return a JSON object with:
- category (string)
- color (string)
- styleTags (array of strings)
- brand (string, only if visible, else null)
- outfitIdeas (array of 3 items, each with 'description' (the stylized suggestion) and 'searchQuery' (simple product search term))
`
            },
            {
                role: "user",
                content: [
                    { type: "text", text: "Analyze this clothing item." },
                    {
                        type: "image_url",
                        image_url: {
                            "url": imageUrl,
                        },
                    },
                ],
            },
        ],
        response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No analysis result");

    return JSON.parse(content) as AnalysisResult;
}
