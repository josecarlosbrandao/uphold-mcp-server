/**
 * Module imports.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAssetsTool } from './assets';
import { registerCountriesTool } from './countries';
import { registerTickerTools } from './tickers';

/**
 * Register all tools in the MCP server
 */

export function registerTools(server: McpServer): void {
  registerAssetsTool(server);
  registerCountriesTool(server);
  registerTickerTools(server);
}
