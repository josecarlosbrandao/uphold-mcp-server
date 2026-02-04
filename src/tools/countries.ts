/**
 * Countries Tool
 *
 * MCP tool for fetching supported countries from Uphold's public API.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { UpholdApiError } from '../types';
import { UpholdClient } from '../client';

/**
 * Register the countries tool with the MCP server
 */
export function registerCountriesTool(server: McpServer): void {
  const upholdClient = new UpholdClient();

  server.registerTool(
    'get-countries',
    {
      description: 'Get all supported countries on Uphold. Returns a list of countries where Uphold services are available, including country codes, names, and local currencies.'
    },
    async () => {
      try {
        const countries = await upholdClient.getCountries();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(countries, null, 2)
            }
          ]
        };
      } catch (error) {
        const message = error instanceof UpholdApiError
          ? `Failed to fetch countries: ${error.message}`
          : `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
        return {
          content: [{ type: 'text', text: message }],
          isError: true
        };
      }
    }
  );
}
