/**
 * Module imports.
 */

import { UpholdApiError } from '../../src/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registerAssetsTool } from '../../src/tools/assets';
import type { Asset } from '../../src/types';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const mockGetAssets = vi.fn();

vi.mock('../../src/client', () => {
  return {
    UpholdClient: class {
      getAssets = mockGetAssets;
    }
  };
});

interface ToolConfig {
  description?: string;
  inputSchema?: Record<string, unknown>;
}

interface ToolHandler<T = Record<string, never>> {
  (params: T): Promise<{
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
  }>;
}

interface RegisteredTool {
  config: ToolConfig;
  handler: ToolHandler;
}

describe('Assets Tool', () => {
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

    registerAssetsTool(mockServer);
  });

  describe('get-assets', () => {
    it('should register the tool', () => {
      expect(mockServer.registerTool).toHaveBeenCalledTimes(1);
      expect(mockServer.registerTool).toHaveBeenCalledWith(
        'get-assets',
        expect.objectContaining({
          description: expect.stringContaining('supported assets')
        }),
        expect.any(Function)
      );
    });

    it('should return assets on success', async () => {
      const mockAssets: Asset[] = [
        { code: 'BTC', name: 'Bitcoin', status: 'open', type: 'cryptocurrency' },
        { code: 'USD', name: 'US Dollar', status: 'open', type: 'fiat' }
      ];
      mockGetAssets.mockResolvedValueOnce(mockAssets);

      const tool = registeredTools.get('get-assets');
      if (!tool) throw new Error('Tool not registered');

      const result = await tool.handler({});

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(JSON.parse(result.content[0].text)).toEqual(mockAssets);
    });

    it('should handle UpholdApiError', async () => {
      const error = new UpholdApiError('API Error', 500, '/assets');
      mockGetAssets.mockRejectedValueOnce(error);

      const tool = registeredTools.get('get-assets');
      if (!tool) throw new Error('Tool not registered');

      const result = await tool.handler({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to fetch assets');
    });

    it('should handle unexpected errors', async () => {
      mockGetAssets.mockRejectedValueOnce(new Error('Network error'));

      const tool = registeredTools.get('get-assets');
      if (!tool) throw new Error('Tool not registered');

      const result = await tool.handler({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unexpected error');
      expect(result.content[0].text).toContain('Network error');
    });
  });
});
