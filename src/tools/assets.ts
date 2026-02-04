/**
 * Module imports.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { UpholdApiError } from '../types';
import { UpholdClient } from '../client';

/**
 * Register the assets tool with the MCP server.
 */

export function registerAssetsTool(server: McpServer): void {
  const upholdClient = new UpholdClient();

  server.registerTool(
    'get-assets',
    {
      description: 'Get all supported assets on Uphold. Returns a list of all cryptocurrencies and fiat currencies available for trading, including their codes, names, status, and type.'
    },
    async () => {
      try {
        const assets = await upholdClient.getAssets();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(assets, null, 2)
            }
          ]
        };
      } catch (error) {
        const message = error instanceof UpholdApiError
          ? `Failed to fetch assets: ${error.message}`
          : `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
        return {
          content: [{ type: 'text', text: message }],
          isError: true
        };
      }
    }
  );
}
