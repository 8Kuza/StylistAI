import { AffiliateProvider, NormalizedListing } from './types';
import crypto from 'crypto';

export class ShareASaleProvider implements AffiliateProvider {
    name = "ShareASale";
    networkName = "ShareASale";

    private token = process.env.SHAREASALE_TOKEN;
    private secret = process.env.SHAREASALE_SECRET;
    private affiliateId = process.env.SHAREASALE_USERID; // Setup required

    async search(query: string): Promise<NormalizedListing[]> {
        if (!this.token || !this.secret || !this.affiliateId) {
            console.warn("ShareASale credentials missing. Skipping.");
            return [];
        }

        try {
            // ShareASale typically requires specific auth headers with timestamp/sig
            const timestamp = new Date().toUTCString();
            const actionVerb = "productSearch";
            const sig = crypto.createHash('sha256').update(`${this.token}:${timestamp}:${actionVerb}:${this.secret}`).digest('hex');

            const url = `https://api.shareasale.com/x.cfm?action=${actionVerb}&affiliateId=${this.affiliateId}&keyword=${encodeURIComponent(query)}&format=json`;

            const response = await fetch(url, {
                headers: {
                    'x-ShareASale-Date': timestamp,
                    'x-ShareASale-Authentication': sig
                }
            });

            if (!response.ok) {
                console.error(`ShareASale API error: ${response.status}`);
                return [];
            }

            const data = await response.json();
            const products = data.products || [];

            return products.map((prod: any) => ({
                id: `sas-${prod.productId || Math.random()}`,
                platform: prod.merchant || 'ShareASale Merchant',
                name: prod.name,
                price: parseFloat(prod.price) || null,
                currency: 'USD',
                imageUrl: prod.image || prod.thumbnail,
                url: prod.link,
                isAffiliate: true,
                source: 'ShareASale',
                brand: prod.merchant
            }));

        } catch (error) {
            console.error("ShareASaleProvider search error:", error);
            return [];
        }
    }
}
