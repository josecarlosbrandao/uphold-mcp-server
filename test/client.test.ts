/**
 * Module imports.
 */

import { UpholdClient } from '../src/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as httpClient from '../src/utils/http-client';
import type { Asset, Country, Ticker } from '../src/types';

vi.mock('../src/utils/http-client', () => ({
  request: vi.fn()
}));

const mockRequest = httpClient.request as ReturnType<typeof vi.fn>;

describe('UpholdClient', () => {
  let client: UpholdClient;

  beforeEach(() => {
    vi.resetAllMocks();
    client = new UpholdClient();
  });

  describe('constructor', () => {
    it('should create client with environment variable base URL', () => {
      const envClient = new UpholdClient();
      expect(envClient).toBeInstanceOf(UpholdClient);
    });

    it('should throw error if environment variable is not set', () => {
      const originalEnv = process.env.UPHOLD_API_BASE_URL;
      delete process.env.UPHOLD_API_BASE_URL;

      expect(() => new UpholdClient()).toThrow(
        'UPHOLD_API_BASE_URL environment variable is required'
      );

      // Restore for subsequent tests.
      process.env.UPHOLD_API_BASE_URL = originalEnv;
    });
  });

  describe('getAssets', () => {
    it('should fetch all assets', async () => {
      const mockAssets: Asset[] = [
        { code: 'BTC', name: 'Bitcoin', status: 'open', type: 'cryptocurrency' }
      ];
      mockRequest.mockResolvedValueOnce(mockAssets);

      const result = await client.getAssets();

      expect(result).toEqual(mockAssets);
      expect(httpClient.request).toHaveBeenCalledTimes(1);
      expect(httpClient.request).toHaveBeenCalledWith(
        '/assets',
        expect.objectContaining({
          baseUrl: expect.any(String),
          userAgent: 'uphold-mcp-server/1.0.0'
        })
      );
    });
  });

  describe('getCountries', () => {
    it('should fetch all countries', async () => {
      const mockCountries: Country[] = [
        { code: 'US', name: 'United States', currency: 'USD' }
      ];
      mockRequest.mockResolvedValueOnce(mockCountries);

      const result = await client.getCountries();

      expect(result).toEqual(mockCountries);
      expect(httpClient.request).toHaveBeenCalledTimes(1);
      expect(httpClient.request).toHaveBeenCalledWith(
        '/countries',
        expect.objectContaining({
          baseUrl: expect.any(String),
          userAgent: 'uphold-mcp-server/1.0.0'
        })
      );
    });
  });

  describe('getTickerByCurrency', () => {
    it('should fetch tickers for a specific currency', async () => {
      const mockTickers: Ticker[] = [
        { ask: '100', bid: '99', currency: 'USD', pair: 'BTCUSD' }
      ];
      mockRequest.mockResolvedValueOnce(mockTickers);

      const result = await client.getTickerByCurrency('BTC');

      expect(result).toEqual(mockTickers);
      expect(httpClient.request).toHaveBeenCalledTimes(1);
      expect(httpClient.request).toHaveBeenCalledWith(
        '/ticker/BTC',
        expect.objectContaining({
          baseUrl: expect.any(String),
          userAgent: 'uphold-mcp-server/1.0.0'
        })
      );
    });

    it('should encode special characters in currency', async () => {
      const mockTickers: Ticker[] = [];
      mockRequest.mockResolvedValueOnce(mockTickers);

      await client.getTickerByCurrency('BTC/USD');

      expect(httpClient.request).toHaveBeenCalledTimes(1);
      expect(httpClient.request).toHaveBeenCalledWith(
        '/ticker/BTC%2FUSD',
        expect.objectContaining({
          baseUrl: expect.any(String),
          userAgent: 'uphold-mcp-server/1.0.0'
        })
      );
    });
  });

  describe('getTickerPair', () => {
    it('should fetch a specific ticker pair', async () => {
      const mockTicker: Ticker = { ask: '100', bid: '99', currency: 'USD', pair: 'BTCUSD' };
      mockRequest.mockResolvedValueOnce(mockTicker);

      const result = await client.getTickerPair('BTCUSD');

      expect(result).toEqual(mockTicker);
      expect(httpClient.request).toHaveBeenCalledTimes(1);
      expect(httpClient.request).toHaveBeenCalledWith(
        '/ticker/BTCUSD',
        expect.objectContaining({
          baseUrl: expect.any(String),
          userAgent: 'uphold-mcp-server/1.0.0'
        })
      );
    });

    it('should encode special characters in pair', async () => {
      const mockTicker: Ticker = { ask: '100', bid: '99', currency: 'USD', pair: 'BTCUSD' };
      mockRequest.mockResolvedValueOnce(mockTicker);

      await client.getTickerPair('BTC/USD');

      expect(httpClient.request).toHaveBeenCalledTimes(1);
      expect(httpClient.request).toHaveBeenCalledWith(
        '/ticker/BTC%2FUSD',
        expect.objectContaining({
          baseUrl: expect.any(String),
          userAgent: 'uphold-mcp-server/1.0.0'
        })
      );
    });
  });
});
