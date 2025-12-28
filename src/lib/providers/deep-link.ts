import { ListingsProvider, NormalizedListing } from './types';

interface PlatformConfig {
    name: string;
    generateUrl: (query: string) => string;
    label: string;
}

export class DeepLinkProvider implements ListingsProvider {
    name = "DeepLink";
    private platforms: PlatformConfig[] = [
        {
            name: 'Depop',
            label: 'Search on Depop',
            generateUrl: (q) => `https://www.depop.com/search/?q=${encodeURIComponent(q)}`
        },
        {
            name: 'Vinted',
            label: 'Search on Vinted',
            generateUrl: (q) => `https://www.vinted.com/catalog?search_text=${encodeURIComponent(q)}`
        },
        {
            name: 'eBay',
            label: 'Search on eBay',
            generateUrl: (q) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}`
        }
    ];

    async search(query: string): Promise<NormalizedListing[]> {
        // Deep links don't provide individual listings, they provide a "View Search Results" link.
        // We will return one "listing" per platform that acts as a portal to that platform's search.

        return this.platforms.map(platform => ({
            id: `deeplink-${platform.name.toLowerCase()}-${Date.now()}`,
            platform: platform.name,
            name: `${platform.label}: "${query}"`,
            price: null, // Price is unknown until user clicks
            currency: 'USD',
            imageUrl: null, // No image to show for a general search link
            url: platform.generateUrl(query),
            isAffiliate: false,
            source: 'DeepLink'
        }));
    }
}
