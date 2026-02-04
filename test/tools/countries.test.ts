/**
 * Module imports.
 */

import { UpholdApiError } from '../../src/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registerCountriesTool } from '../../src/tools/countries';
import type { Country } from '../../src/types';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const mockGetCountries = vi.fn();

vi.mock('../../src/client', () => {
  return {
    UpholdClient: class {
      getCountries = mockGetCountries;
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

describe('Countries Tool', () => {
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

    registerCountriesTool(mockServer);
  });

  describe('get-countries', () => {
    it('should register the tool', () => {
      expect(mockServer.registerTool).toHaveBeenCalledTimes(1);
      expect(mockServer.registerTool).toHaveBeenCalledWith(
        'get-countries',
        expect.objectContaining({
          description: expect.stringContaining('supported countries')
        }),
        expect.any(Function)
      );
    });

    it('should return countries on success', async () => {
      const mockCountries: Country[] = [
        { code: 'US', name: 'United States', currency: 'USD' },
        { code: 'GB', name: 'United Kingdom', currency: 'GBP' }
      ];
      mockGetCountries.mockResolvedValueOnce(mockCountries);

      const tool = registeredTools.get('get-countries');
      if (!tool) throw new Error('Tool not registered');

      const result = await tool.handler({});

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(JSON.parse(result.content[0].text)).toEqual(mockCountries);
    });

    it('should handle UpholdApiError', async () => {
      const error = new UpholdApiError('API Error', 503, '/countries');
      mockGetCountries.mockRejectedValueOnce(error);

      const tool = registeredTools.get('get-countries');
      if (!tool) throw new Error('Tool not registered');

      const result = await tool.handler({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to fetch countries');
    });

    it('should handle unexpected errors', async () => {
      mockGetCountries.mockRejectedValueOnce(new Error('Connection timeout'));

      const tool = registeredTools.get('get-countries');
      if (!tool) throw new Error('Tool not registered');

      const result = await tool.handler({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unexpected error');
      expect(result.content[0].text).toContain('Connection timeout');
    });
  });
});
