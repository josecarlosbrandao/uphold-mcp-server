#!/usr/bin/env node

// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// src/tools/tickers.ts
import { z } from "zod";

// src/api/client.ts
var UpholdApiError = class extends Error {
  constructor(message, statusCode, endpoint) {
    super(message);
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.name = "UpholdApiError";
  }
};
async function request(endpoint) {
  const url = `${process.env.UPHOLD_API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "uphold-mcp-server/1.0.0"
    }
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new UpholdApiError(
      `Uphold API error: ${response.status} ${response.statusText} - ${errorText}`,
      response.status,
      endpoint
    );
  }
  return response.json();
}
var upholdClient = {
  /**
   * Get all tickers (exchange rates for all currency pairs)
   * GET /v0/ticker
   */
  getAllTickers: () => {
    return request("/ticker");
  },
  /**
   * Get all supported assets (cryptocurrencies and fiat currencies)
   * GET /v0/assets
   */
  getAssets: () => {
    return request("/assets");
  },
  /**
   * Get all supported countries
   * GET /v0/countries
   */
  getCountries: () => {
    return request("/countries");
  },
  /**
   * Get tickers for a specific currency
   * GET /v0/ticker/:currency
   * @param currency - Currency code (e.g., 'USD', 'BTC', 'ETH')
   */
  getTickerByCurrency: (currency) => {
    return request(`/ticker/${encodeURIComponent(currency)}`);
  },
  /**
   * Get ticker for a specific currency pair
   * GET /v0/ticker/:pair
   * @param pair - Currency pair (e.g., 'BTCUSD', 'ETHUSD')
   */
  getTickerPair: (pair) => {
    return request(`/ticker/${encodeURIComponent(pair)}`);
  }
};

// src/tools/tickers.ts
function registerTickerTools(server2) {
  server2.registerTool(
    "get-all-tickers",
    {
      description: "Get exchange rates for all currency pairs on Uphold. Returns ask and bid prices for every available trading pair. Useful for getting a complete market overview."
    },
    async () => {
      try {
        const tickers = await upholdClient.getAllTickers();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(tickers, null, 2)
            }
          ]
        };
      } catch (error) {
        const message = error instanceof UpholdApiError ? `Failed to fetch tickers: ${error.message}` : `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
        return {
          content: [{ type: "text", text: message }],
          isError: true
        };
      }
    }
  );
  server2.registerTool(
    "get-ticker-by-currency",
    {
      description: "Get exchange rates for a specific currency against all other currencies on Uphold. For example, get all BTC trading pairs or all USD trading pairs.",
      inputSchema: {
        currency: z.string().describe("The currency code to get rates for (e.g., 'USD', 'BTC', 'ETH', 'EUR')")
      }
    },
    async ({ currency }) => {
      try {
        const tickers = await upholdClient.getTickerByCurrency(currency);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(tickers, null, 2)
            }
          ]
        };
      } catch (error) {
        const message = error instanceof UpholdApiError ? `Failed to fetch ticker for ${currency}: ${error.message}` : `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
        return {
          content: [{ type: "text", text: message }],
          isError: true
        };
      }
    }
  );
  server2.registerTool(
    "get-ticker-pair",
    {
      description: "Get the exchange rate for a specific currency pair on Uphold. Returns the ask and bid prices for the pair. The pair format is the two currency codes concatenated (e.g., 'BTCUSD' for Bitcoin to US Dollar).",
      inputSchema: {
        pair: z.string().describe("The currency pair to get the rate for (e.g., 'BTCUSD', 'ETHUSD', 'BTCEUR')")
      }
    },
    async ({ pair }) => {
      try {
        const ticker = await upholdClient.getTickerPair(pair);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(ticker, null, 2)
            }
          ]
        };
      } catch (error) {
        const message = error instanceof UpholdApiError ? `Failed to fetch ticker for pair ${pair}: ${error.message}` : `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
        return {
          content: [{ type: "text", text: message }],
          isError: true
        };
      }
    }
  );
}

// src/tools/assets.ts
function registerAssetsTool(server2) {
  server2.registerTool(
    "get-assets",
    {
      description: "Get all supported assets on Uphold. Returns a list of all cryptocurrencies and fiat currencies available for trading, including their codes, names, status, and type."
    },
    async () => {
      try {
        const assets = await upholdClient.getAssets();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(assets, null, 2)
            }
          ]
        };
      } catch (error) {
        const message = error instanceof UpholdApiError ? `Failed to fetch assets: ${error.message}` : `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
        return {
          content: [{ type: "text", text: message }],
          isError: true
        };
      }
    }
  );
}

// src/tools/countries.ts
function registerCountriesTool(server2) {
  server2.registerTool(
    "get-countries",
    {
      description: "Get all supported countries on Uphold. Returns a list of countries where Uphold services are available, including country codes, names, and local currencies."
    },
    async () => {
      try {
        const countries = await upholdClient.getCountries();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(countries, null, 2)
            }
          ]
        };
      } catch (error) {
        const message = error instanceof UpholdApiError ? `Failed to fetch countries: ${error.message}` : `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
        return {
          content: [{ type: "text", text: message }],
          isError: true
        };
      }
    }
  );
}

// src/tools/index.ts
function registerAllTools(server2) {
  registerTickerTools(server2);
  registerAssetsTool(server2);
  registerCountriesTool(server2);
}

// src/index.ts
var server = new McpServer({
  name: "uphold-mcp-server",
  version: "1.0.0"
});
registerAllTools(server);
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Uphold MCP Server started successfully");
  console.error("Available tools: get-all-tickers, get-ticker-by-currency, get-ticker-pair, get-assets, get-countries");
}
main().catch((error) => {
  console.error("Fatal error starting Uphold MCP Server:", error);
  process.exit(1);
});
