import { AffiliateProvider, NormalizedListing } from './types';

export class ImpactProvider implements AffiliateProvider {
    name = "Impact";
    networkName = "Impact.com";

    private accountSid = process.env.IMPACT_SID;
    private authToken = process.env.IMPACT_TOKEN;

    async search(query: string): Promise<NormalizedListing[]> {
        if (!this.accountSid || !this.authToken) {
            console.warn("Impact.com credentials missing. Skipping.");
            return [];
        }

        try {
            // Using the actual Impact Catalog Search API endpoint structure
            // GET /Mediapartners/{AccountSID}/Catalogs/ItemSearch
            const url = `https://api.impact.com/Mediapartners/${this.accountSid}/Catalogs/ItemSearch?Query=${encodeURIComponent(query)}&Limit=5`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(this.accountSid + ':' + this.authToken).toString('base64'),
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                console.error(`Impact API error: ${response.status} ${response.statusText}`);
                return [];
            }

            const data = await response.json();

            // Map Impact response to NormalizedListing
            // Note: Actual Impact response structure varies, assuming standard fields here based on docs
            // Adjust property access based on actual JSON response if needed (Items or Records array)
            const items = data.Items || [];

            return items.map((item: any) => ({
                id: `impact-${item.Id || Math.random()}`,
                platform: item.Manufacturer || 'Impact Retailer',
                name: item.Name,
                price: parseFloat(item.CurrentPrice || item.Price || '0') || null,
                currency: item.Currency || 'USD',
                imageUrl: item.ImageUrl,
                url: item.Url, // Affiliate tracking URL
                isAffiliate: true,
                source: 'Impact',
                brand: item.Manufacturer
            }));

        } catch (error) {
            console.error("ImpactProvider search error:", error);
            return [];
        }
    }
}
