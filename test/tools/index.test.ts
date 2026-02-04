/**
 * Module imports.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registerTools } from '../../src/tools/index';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

vi.mock('../../src/tools/tickers', () => ({
  registerTickerTools: vi.fn()
}));

vi.mock('../../src/tools/assets', () => ({
  registerAssetsTool: vi.fn()
}));

vi.mock('../../src/tools/countries', () => ({
  registerCountriesTool: vi.fn()
}));

describe('Tool Registry', () => {
  let mockServer: McpServer;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockServer = {
      registerTool: vi.fn()
    } as unknown as McpServer;
  });

  describe('registerTools', () => {
    it('should register all tool types', async () => {
      const { registerTickerTools } = await import('../../src/tools/tickers');
      const { registerAssetsTool } = await import('../../src/tools/assets');
      const { registerCountriesTool } = await import('../../src/tools/countries');

      registerTools(mockServer);

      expect(registerTickerTools).toHaveBeenCalledTimes(1);
      expect(registerTickerTools).toHaveBeenCalledWith(mockServer);

      expect(registerAssetsTool).toHaveBeenCalledTimes(1);
      expect(registerAssetsTool).toHaveBeenCalledWith(mockServer);

      expect(registerCountriesTool).toHaveBeenCalledTimes(1);
      expect(registerCountriesTool).toHaveBeenCalledWith(mockServer);
    });

    it('should register tools in correct order', async () => {
      const callOrder: string[] = [];

      const { registerTickerTools } = await import('../../src/tools/tickers');
      const { registerAssetsTool } = await import('../../src/tools/assets');
      const { registerCountriesTool } = await import('../../src/tools/countries');

      const mockRegisterTickerTools = registerTickerTools as ReturnType<typeof vi.fn>;
      const mockRegisterAssetsTool = registerAssetsTool as ReturnType<typeof vi.fn>;
      const mockRegisterCountriesTool = registerCountriesTool as ReturnType<typeof vi.fn>;

      mockRegisterTickerTools.mockImplementation(() => {
        callOrder.push('tickers');
      });

      mockRegisterAssetsTool.mockImplementation(() => {
        callOrder.push('assets');
      });

      mockRegisterCountriesTool.mockImplementation(() => {
        callOrder.push('countries');
      });

      registerTools(mockServer);

      expect(callOrder).toEqual(['assets', 'countries', 'tickers']);
    });
  });
});
