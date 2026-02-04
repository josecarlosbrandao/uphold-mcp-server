/**
 * Module imports.
 */

import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from './utils/logger';
import { registerTools } from './tools';

const server = new McpServer({
  name: 'uphold-mcp-server',
  version: '1.0.0'
});

registerTools(server);

/**
 * Uphold MCP Server.
 *
 * A Model Context Protocol (MCP) server that exposes Uphold's public
 * cryptocurrency APIs as tools for AI assistants like Claude.
 *
 * This server provides access to:
 * - Exchange rate tickers for all currency pairs.
 * - Supported assets (cryptocurrencies and fiat currencies).
 * - Supported countries.
 *
 * No authentication required - uses only public endpoints.
 */

async function main(): Promise<void> {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  logger.info('Uphold MCP Server started successfully');
  logger.info('Available tools: get-assets, get-countries, get-ticker-by-currency, get-ticker-pair');
}

main().catch((error) => {
  logger.error({ error }, 'Fatal error starting Uphold MCP Server');
  process.exit(1);
});
