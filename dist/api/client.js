/**
 * Uphold API Client
 *
 * Provides fetch-based HTTP requests to Uphold's public API endpoints.
 * No authentication required for these endpoints.
 *
 * API Documentation: https://docs.uphold.com/
 */
const BASE_URL = "https://api.uphold.com/v0";
/**
 * API Error class for Uphold-specific errors
 */
export class UpholdApiError extends Error {
    statusCode;
    endpoint;
    constructor(message, statusCode, endpoint) {
        super(message);
        this.statusCode = statusCode;
        this.endpoint = endpoint;
        this.name = "UpholdApiError";
    }
}
/**
 * Make a GET request to the Uphold API
 */
async function request(endpoint) {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "uphold-mcp-server/1.0.0"
        }
    });
    if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new UpholdApiError(`Uphold API error: ${response.status} ${response.statusText} - ${errorText}`, response.status, endpoint);
    }
    return response.json();
}
/**
 * Uphold API Client with methods for all public endpoints
 */
export const upholdClient = {
    /**
     * Get all tickers (exchange rates for all currency pairs)
     * GET /v0/ticker
     */
    getAllTickers: () => {
        return request("/ticker");
    },
    /**
     * Get tickers for a specific currency
     * GET /v0/ticker/:currency
     * @param currency - Currency code (e.g., 'USD', 'BTC', 'ETH')
     */
    getTickerByCurrency: (currency) => {
        return request(`/ticker/${encodeURIComponent(currency)}`);
    },
    /**
     * Get ticker for a specific currency pair
     * GET /v0/ticker/:pair
     * @param pair - Currency pair (e.g., 'BTCUSD', 'ETHUSD')
     */
    getTickerPair: (pair) => {
        return request(`/ticker/${encodeURIComponent(pair)}`);
    },
    /**
     * Get all supported assets (cryptocurrencies and fiat currencies)
     * GET /v0/assets
     */
    getAssets: () => {
        return request("/assets");
    },
    /**
     * Get all supported countries
     * GET /v0/countries
     */
    getCountries: () => {
        return request("/countries");
    }
};
//# sourceMappingURL=client.js.map