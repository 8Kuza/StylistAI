import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "mock-key-for-build",
});

export async function generateEmbedding(text: string): Promise<number[]> {
    // For MVP, we might embed the textual description from the Vision analysis
    // as a proxy for visual similarity if we don't have a CLIP model running.
    // Or we can use OpenAI's CLIP if available via API (not standard).
    // Standard approach: Embed the JSON string or a descriptive sentence.

    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
    });

    return response.data[0].embedding;
}
