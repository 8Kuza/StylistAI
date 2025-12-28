import { Product } from './products';

export interface PriceVerdict {
    verdict: 'STEAL' | 'FAIR' | 'OVERPRICED';
    medianPrice: number;
    lowestPrice: number;
    highestPrice: number;
    range: { min: number; max: number };
}

export function calculateVerdict(userPrice: number, similarProducts: Product[]): PriceVerdict | null {
    // Filter out products with no price (deep links)
    const validProducts = similarProducts.filter(p => p.price !== null && p.price !== undefined);

    if (validProducts.length === 0) {
        return null;
    }

    const prices = validProducts.map(p => p.price as number).sort((a, b) => a - b);

    // Need at least one price to compare, but ideally more.
    if (prices.length === 0) return null;

    const lowestPrice = prices[0];
    const highestPrice = prices[prices.length - 1];

    // Median
    const mid = Math.floor(prices.length / 2);
    const medianPrice = prices.length % 2 !== 0
        ? prices[mid]
        : (prices[mid - 1] + prices[mid]) / 2;

    // Percentiles for verdict
    const p25Index = Math.floor(prices.length * 0.25);
    const p75Index = Math.floor(prices.length * 0.75);

    const p25 = prices[p25Index];
    const p75 = prices[p75Index];

    let verdict: 'STEAL' | 'FAIR' | 'OVERPRICED' = 'FAIR';

    if (userPrice <= p25) verdict = 'STEAL';
    else if (userPrice >= p75) verdict = 'OVERPRICED';

    return {
        verdict,
        medianPrice,
        lowestPrice,
        highestPrice,
        range: { min: lowestPrice, max: highestPrice }
    };
}
