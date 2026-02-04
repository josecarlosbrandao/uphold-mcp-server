/**
 * Module imports.
 */

import { UpholdApiError } from '../../src/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { request } from '../../src/utils/http-client';

describe('HTTP Client', () => {
  const originalFetch = global.fetch;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch as unknown as typeof global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('request', () => {
    it('should make a successful GET request', async () => {
      const mockData = { test: 'data' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const config = {
        baseUrl: 'https://api.test.com',
        userAgent: 'test-agent'
      };

      const result = await request('/endpoint', config);

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/endpoint',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'test-agent'
          }
        }
      );
    });

    it('should use default user agent if not provided', async () => {
      const mockData = { test: 'data' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const config = { baseUrl: 'https://api.test.com' };
      await request('/endpoint', config);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': 'http-client/1.0.0'
          })
        })
      );
    });

    it('should throw UpholdApiError on failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Resource not found'
      });

      const config = { baseUrl: 'https://api.test.com' };

      await expect(request('/endpoint', config)).rejects.toThrow(UpholdApiError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle error text extraction failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => {
          throw new Error('Failed to read body');
        }
      });

      const config = { baseUrl: 'https://api.test.com' };

      await expect(request('/endpoint', config)).rejects.toThrow(
        'API error: 500 Internal Server Error - Unknown error'
      );
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should include correct endpoint in error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => 'Access denied'
      });

      const config = { baseUrl: 'https://api.test.com' };

      try {
        await request('/forbidden', config);
        // Should not reach here.
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(UpholdApiError);
        expect((error as UpholdApiError).endpoint).toBe('/forbidden');
        expect((error as UpholdApiError).statusCode).toBe(403);
      }

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
