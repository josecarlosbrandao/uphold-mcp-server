/**
 * Module imports.
 */

import { UpholdApiError } from '../../src/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registerTickerTools } from '../../src/tools/tickers';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Ticker } from '../../src/types';

const mockGetTickerByCurrency = vi.fn();
const mockGetTickerPair = vi.fn();

vi.mock('../../src/client', () => {
  return {
    UpholdClient: class {
      getTickerByCurrency = mockGetTickerByCurrency;
      getTickerPair = mockGetTickerPair;
    }
  };
});

interface ToolConfig {
  description?: string;
  inputSchema?: Record<string, unknown>;
}

interface ToolHandler<T = Record<string, unknown>> {
  (params: T): Promise<{
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
  }>;
}

interface RegisteredTool {
  config: ToolConfig;
  handler: ToolHandler;
}

describe('Ticker Tools', () => {
  let mockServer: McpServer;
  let registeredTools: Map<string, RegisteredTool>;

  beforeEach(() => {
    vi.clearAllMocks();
    registeredTools = new Map();

    mockServer = {
      registerTool: vi.fn((
        name: string,
        config: ToolConfig,
        handler: ToolHandler
      ) => {
        registeredTools.set(name, { config, handler });
      })
    } as unknown as McpServer;

    registerTickerTools(mockServer);
  });

  describe('get-ticker-by-currency', () => {
    it('should register the tool with currency parameter', () => {
      const tool = registeredTools.get('get-ticker-by-currency');
      expect(tool).toBeDefined();
      expect(tool?.config.inputSchema).toBeDefined();
    });

    it('should return tickers for a currency', async () => {
      const mockTickers: Ticker[] = [
        { ask: '100', bid: '99', currency: 'USD', pair: 'BTCUSD' }
      ];
      mockGetTickerByCurrency.mockResolvedValueOnce(mockTickers);

      const tool = registeredTools.get('get-ticker-by-currency');
      if (!tool) throw new Error('Tool not registered');

      const result = await tool.handler({ currency: 'BTC' });

      expect(result.content).toHaveLength(1);
      expect(JSON.parse(result.content[0].text)).toEqual(mockTickers);
    });

    it('should handle errors for specific currency', async () => {
      const error = new UpholdApiError('Not found', 404, '/ticker/XYZ');
      mockGetTickerByCurrency.mockRejectedValueOnce(error);

      const tool = registeredTools.get('get-ticker-by-currency');
      if (!tool) throw new Error('Tool not registered');

      const result = await tool.handler({ currency: 'XYZ' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to fetch ticker for XYZ');
    });
  });

  describe('get-ticker-pair', () => {
    it('should register the tool with pair parameter', () => {
      const tool = registeredTools.get('get-ticker-pair');
      expect(tool).toBeDefined();
      expect(tool?.config.inputSchema).toBeDefined();
    });

    it('should return a specific ticker pair', async () => {
      const mockTicker: Ticker = { ask: '100', bid: '99', currency: 'USD', pair: 'BTCUSD' };
      mockGetTickerPair.mockResolvedValueOnce(mockTicker);

      const tool = registeredTools.get('get-ticker-pair');
      if (!tool) throw new Error('Tool not registered');

      const result = await tool.handler({ pair: 'BTCUSD' });

      expect(result.content).toHaveLength(1);
      expect(JSON.parse(result.content[0].text)).toEqual(mockTicker);
    });

    it('should handle errors for specific pair', async () => {
      const error = new UpholdApiError('Not found', 404, '/ticker/INVALID');
      mockGetTickerPair.mockRejectedValueOnce(error);

      const tool = registeredTools.get('get-ticker-pair');
      if (!tool) throw new Error('Tool not registered');

      const result = await tool.handler({ pair: 'INVALID' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to fetch ticker for pair INVALID');
    });
  });
});
