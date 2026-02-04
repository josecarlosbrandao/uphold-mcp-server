/**
 * Uphold API Client
 *
 * Provides fetch-based HTTP requests to Uphold's public API endpoints.
 * No authentication required for these endpoints.
 *
 * API Documentation: https://docs.uphold.com/
 */
/**
 * Ticker response from Uphold API
 */
export interface Ticker {
    ask: string;
    bid: string;
    currency: string;
    pair: string;
}
/**
 * Asset response from Uphold API
 */
export interface Asset {
    code: string;
    name: string;
    status: string;
    type: string;
}
/**
 * Country response from Uphold API
 */
export interface Country {
    code: string;
    name: string;
    currency: string;
}
/**
 * API Error class for Uphold-specific errors
 */
export declare class UpholdApiError extends Error {
    statusCode: number;
    endpoint: string;
    constructor(message: string, statusCode: number, endpoint: string);
}
/**
 * Uphold API Client with methods for all public endpoints
 */
export declare const upholdClient: {
    /**
     * Get all tickers (exchange rates for all currency pairs)
     * GET /v0/ticker
     */
    getAllTickers: () => Promise<Ticker[]>;
    /**
     * Get tickers for a specific currency
     * GET /v0/ticker/:currency
     * @param currency - Currency code (e.g., 'USD', 'BTC', 'ETH')
     */
    getTickerByCurrency: (currency: string) => Promise<Ticker[]>;
    /**
     * Get ticker for a specific currency pair
     * GET /v0/ticker/:pair
     * @param pair - Currency pair (e.g., 'BTCUSD', 'ETHUSD')
     */
    getTickerPair: (pair: string) => Promise<Ticker>;
    /**
     * Get all supported assets (cryptocurrencies and fiat currencies)
     * GET /v0/assets
     */
    getAssets: () => Promise<Asset[]>;
    /**
     * Get all supported countries
     * GET /v0/countries
     */
    getCountries: () => Promise<Country[]>;
};
//# sourceMappingURL=client.d.ts.map