// src/server.ts
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// src/utils/logger.ts
import pino from "pino";
var logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "HH:MM:ss",
      ignore: "pid,hostname",
      destination: 2
    }
  }
});

// src/types.ts
var UpholdApiError = class extends Error {
  constructor(message, statusCode, endpoint) {
    super(message);
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.name = "UpholdApiError";
  }
};

// src/utils/http-client.ts
async function request(endpoint, config) {
  const response = await fetch(`${config.baseUrl}${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": config.userAgent || "http-client/1.0.0"
    }
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new UpholdApiError(
      `API error: ${response.status} ${response.statusText} - ${errorText}`,
      response.status,
      endpoint
    );
  }
  return response.json();
}

// src/client.ts
var UpholdClient = class {
  config;
  constructor() {
    const baseUrl = process.env.UPHOLD_API_BASE_URL;
    if (!baseUrl) {
      throw new Error("UPHOLD_API_BASE_URL environment variable is required");
    }
    this.config = { baseUrl, userAgent: "uphold-mcp-server/1.0.0" };
  }
  /**
   * Get all supported assets (cryptocurrencies and fiat currencies).
   *
   * @see {@link https://docs.uphold.com/#list-supported-assets}
   */
  async getAssets() {
    return request("/assets", this.config);
  }
  /**
   * Get all supported countries.
   *
   * @see {@link https://docs.uphold.com/#countries}
   */
  async getCountries() {
    return request("/countries", this.config);
  }
  /**
   * Get tickers for a specific currency.
   *
   * @param currency - Currency code (e.g., 'USD', 'BTC', 'ETH').
   * @see {@link https://docs.uphold.com/#get-tickers-for-currency}
   */
  async getTickerByCurrency(currency) {
    return request(`/ticker/${encodeURIComponent(currency)}`, this.config);
  }
  /**
   * Get ticker for a specific currency pair.
   *
   * @param pair - Currency pair (e.g., 'BTCUSD', 'ETHUSD').
   * @see {@link https://docs.uphold.com/#get-tickers-for-currency-pair}
   */
  async getTickerPair(pair) {
    return request(`/ticker/${encodeURIComponent(pair)}`, this.config);
  }
};

// src/tools/assets.ts
function registerAssetsTool(server2) {
  const upholdClient = new UpholdClient();
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
  const upholdClient = new UpholdClient();
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

// src/tools/tickers.ts
import { z } from "zod";
function registerTickerTools(server2) {
  const upholdClient = new UpholdClient();
  server2.registerTool(
    "get-ticker-by-currency",
    {
      description: "Get exchange rates for a specific currency against all other currencies on Uphold. For example, get all BTC trading pairs or all USD trading pairs.",
      inputSchema: {
        currency: z.string().describe(`The currency code to get rates for (e.g., 'USD', 'BTC', 'ETH', 'EUR')`)
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
      description: `Get the exchange rate for a specific currency pair on Uphold. Returns the ask and bid prices for the pair. The pair format is the two currency codes concatenated (e.g., 'BTCUSD' for Bitcoin to US Dollar).`,
      inputSchema: {
        pair: z.string().describe(`The currency pair to get the rate for (e.g., 'BTCUSD', 'ETHUSD', 'BTCEUR')`)
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

// src/tools/index.ts
function registerTools(server2) {
  registerAssetsTool(server2);
  registerCountriesTool(server2);
  registerTickerTools(server2);
}

// src/server.ts
var server = new McpServer({
  name: "uphold-mcp-server",
  version: "1.0.0"
});
registerTools(server);
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("Uphold MCP Server started successfully");
  logger.info("Available tools: get-assets, get-countries, get-ticker-by-currency, get-ticker-pair");
}
main().catch((error) => {
  logger.error({ error }, "Fatal error starting Uphold MCP Server");
  process.exit(1);
});
