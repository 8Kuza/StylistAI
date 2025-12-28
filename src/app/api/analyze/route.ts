import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/vision';
import { generateEmbedding } from '@/lib/embeddings';
import { findSimilarProducts, findProductsByQuery, Product } from '@/lib/products';
import { calculateVerdict } from '@/lib/pricing';

export async function POST(req: NextRequest) {
    try {
        const { image, userPrice } = await req.json();

        if (!image) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        // 1. Vision Analysis
        const analysis = await analyzeImage(image);

        // 2. Generate Embedding
        const description = `${analysis.color} ${analysis.styleTags.join(' ')} ${analysis.category}`;
        const embedding = await generateEmbedding(description);

        // 3. Find Similar Products (Global)
        // Construct a more specific query for the "Similar Listings" section
        let searchQuery = `${analysis.color} ${analysis.category}`;
        if (analysis.brand && analysis.brand.toLowerCase() !== 'unknown') {
            searchQuery = `${analysis.brand} ${searchQuery}`;
        }
        if (analysis.styleTags && analysis.styleTags.length > 0) {
            // Add the first style tag for flavor (e.g. "Vintage")
            searchQuery = `${analysis.styleTags[0]} ${searchQuery}`;
        }

        const similarProducts = await findSimilarProducts(embedding, searchQuery);

        // 4. Enrich Outfit Ideas with Products
        const enrichedOutfitIdeas = await Promise.all(
            analysis.outfitIdeas.map(async (idea) => {
                const products = await findProductsByQuery(idea.searchQuery);
                return {
                    ...idea,
                    products
                };
            })
        );

        // Update analysis object to use the enriched structure if needed, or send separately
        // We'll attach it to the analysis object we send back or send as separate field.
        // Let's modify the response structure slightly.

        // 5. Calculate Verdict
        let pricing = null;
        if (similarProducts.length > 0) {
            pricing = calculateVerdict(userPrice || 0, similarProducts);
        }

        return NextResponse.json({
            analysis: {
                ...analysis,
                outfitIdeas: enrichedOutfitIdeas
            },
            similarProducts,
            pricing: pricing ? {
                ...pricing,
                verdict: userPrice && userPrice > 0 ? pricing.verdict : null
            } : null
        });

    } catch (error: any) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
