export interface NormalizedListing {
    id: string;
    platform: string;
    name: string;
    price: number | null;
    currency: string;
    imageUrl: string | null;
    url: string; // Outbound URL (affiliate or deep link)
    isAffiliate: boolean;
    brand?: string;
    source: string; // e.g. "Impact", "CJ", "DeepLink"
}

export interface ListingsProvider {
    name: string;
    search(query: string, options?: { brand?: string; category?: string }): Promise<NormalizedListing[]>;
}

export interface AffiliateProvider extends ListingsProvider {
    networkName: string;
}
