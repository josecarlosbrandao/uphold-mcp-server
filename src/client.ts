/**
 * Module imports.
 */

import { Asset, Country, Ticker } from './types';
import { request, type HttpClientConfig } from './utils/http-client';

/**
 * Uphold API Client with methods for all public endpoints.
 * Requires UPHOLD_API_BASE_URL environment variable to be set.
 *
 * @see {@link https://docs.uphold.com/}
 */

export class UpholdClient {
  private config: HttpClientConfig;

  constructor() {
    const baseUrl = process.env.UPHOLD_API_BASE_URL;

    if (!baseUrl) {
      throw new Error('UPHOLD_API_BASE_URL environment variable is required');
    }

    this.config = { baseUrl, userAgent: 'uphold-mcp-server/1.0.0' };
  }

  /**
   * Get all supported assets (cryptocurrencies and fiat currencies).
   *
   * @see {@link https://docs.uphold.com/#list-supported-assets}
   */

  async getAssets(): Promise<Asset[]> {
    return request<Asset[]>('/assets', this.config);
  }

  /**
   * Get all supported countries.
   *
   * @see {@link https://docs.uphold.com/#countries}
   */

  async getCountries(): Promise<Country[]> {
    return request<Country[]>('/countries', this.config);
  }

  /**
   * Get tickers for a specific currency.
   *
   * @param currency - Currency code (e.g., 'USD', 'BTC', 'ETH').
   * @see {@link https://docs.uphold.com/#get-tickers-for-currency}
   */

  async getTickerByCurrency(currency: string): Promise<Ticker[]> {
    return request<Ticker[]>(`/ticker/${encodeURIComponent(currency)}`, this.config);
  }

  /**
   * Get ticker for a specific currency pair.
   *
   * @param pair - Currency pair (e.g., 'BTCUSD', 'ETHUSD').
   * @see {@link https://docs.uphold.com/#get-tickers-for-currency-pair}
   */

  async getTickerPair(pair: string): Promise<Ticker> {
    return request<Ticker>(`/ticker/${encodeURIComponent(pair)}`, this.config);
  }
}
