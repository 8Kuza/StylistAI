import { AffiliateProvider, NormalizedListing } from './types';

// CJ Affiliate uses GraphQL or REST. This implies using the Product Search API (REST).
export class CJProvider implements AffiliateProvider {
    name = "CJ";
    networkName = "CJ Affiliate";

    private developerKey = process.env.CJ_TOKEN;
    private websiteId = process.env.CJ_ID; // Often required/website ID context

    async search(query: string): Promise<NormalizedListing[]> {
        if (!this.developerKey) {
            console.warn("CJ credentials missing. Skipping.");
            return [];
        }

        try {
            // CJ Product Search Service URL (v4)
            const url = `https://ads.api.cj.com/v2/product-search?website-id=${this.websiteId}&advertiser-ids=joined&keywords=${encodeURIComponent(query)}&records-per-page=5`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.developerKey}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                console.error(`CJ API error: ${response.status} ${response.statusText}`);
                return [];
            }

            const data = await response.json();
            const products = data.products || []; // Adjust based on actual XML/JSON conversion if CJ returns XML by default (v2 often is XML, but json accepted)

            return products.map((prod: any) => ({
                id: `cj-${prod.adId || Math.random()}`,
                platform: prod.advertiserName || 'CJ Merchant',
                name: prod.name,
                price: parseFloat(prod.price) || null,
                currency: prod.currency || 'USD',
                imageUrl: prod.imageUrl,
                url: prod.clickUrl,
                isAffiliate: true,
                source: 'CJ',
                brand: prod.advertiserName
            }));

        } catch (error) {
            console.error("CJProvider search error:", error);
            return [];
        }
    }
}
