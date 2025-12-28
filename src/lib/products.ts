import { DeepLinkProvider } from './providers/deep-link';
import { StockXProvider } from './providers/stockx';
import { AmazonProvider } from './providers/amazon';
import { NormalizedListing } from './providers/types';
import { ImpactProvider } from './providers/impact';
import { CJProvider } from './providers/cj';
import { RakutenProvider } from './providers/rakuten';
import { ShareASaleProvider } from './providers/shareasale';

// Re-export standard Product type based on our NormalizedListing to keep app consistent
// We align the frontend Product type with NormalizedListing
export interface Product extends NormalizedListing { }

const affiliateProviders = [
    new ImpactProvider(),
    new CJProvider(),
    new RakutenProvider(),
    new ShareASaleProvider()
];

const fallbackProviders = [
    new AmazonProvider(), // Amazon often has good conversion but lower rate than direct brand affiliate
    new StockXProvider(),
    new DeepLinkProvider(),
];

// Basic text search for MVP (replaces vector search for this specific feature if needed, or uses same pool)
export async function findProductsByQuery(query: string): Promise<Product[]> {
    try {
        // 1. Try Affiliate Providers First (Parallel)
        const affiliateResults = await Promise.all(
            affiliateProviders.map(p => p.search(query))
        );
        const flatAffiliate = affiliateResults.flat();

        // 2. Always fetch fallbacks to ensure we have something (especially DeepLinks for resale reference)
        const fallbackResults = await Promise.all(
            fallbackProviders.map(p => p.search(query))
        );
        const flatFallback = fallbackResults.flat();

        // Combine: Affiliates first, then Fallbacks
        return [...flatAffiliate, ...flatFallback];

    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

export async function findSimilarProducts(embedding: number[], query: string): Promise<Product[]> {
    // In this "Real Data" integration without a fully populated vector DB,
    // we use the refined query term to generate live search links.
    return findProductsByQuery(query);
}
