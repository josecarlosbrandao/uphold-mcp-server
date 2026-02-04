/**
 * Ticker Tools
 *
 * MCP tools for fetching exchange rate data from Uphold's public API.
 */
import { z } from "zod";
import { upholdClient, UpholdApiError } from "../api/client";
/**
 * Register all ticker-related tools with the MCP server
 */
export function registerTickerTools(server) {
    // Tool: get-all-tickers
    server.registerTool("get-all-tickers", {
        description: "Get exchange rates for all currency pairs on Uphold. Returns ask and bid prices for every available trading pair. Useful for getting a complete market overview."
    }, async () => {
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
        }
        catch (error) {
            const message = error instanceof UpholdApiError
                ? `Failed to fetch tickers: ${error.message}`
                : `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
            return {
                content: [{ type: "text", text: message }],
                isError: true
            };
        }
    });
    // Tool: get-ticker-by-currency
    server.registerTool("get-ticker-by-currency", {
        description: "Get exchange rates for a specific currency against all other currencies on Uphold. For example, get all BTC trading pairs or all USD trading pairs.",
        inputSchema: {
            currency: z
                .string()
                .describe("The currency code to get rates for (e.g., 'USD', 'BTC', 'ETH', 'EUR')")
        }
    }, async ({ currency }) => {
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
        }
        catch (error) {
            const message = error instanceof UpholdApiError
                ? `Failed to fetch ticker for ${currency}: ${error.message}`
                : `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
            return {
                content: [{ type: "text", text: message }],
                isError: true
            };
        }
    });
    // Tool: get-ticker-pair
    server.registerTool("get-ticker-pair", {
        description: "Get the exchange rate for a specific currency pair on Uphold. Returns the ask and bid prices for the pair. The pair format is the two currency codes concatenated (e.g., 'BTCUSD' for Bitcoin to US Dollar).",
        inputSchema: {
            pair: z
                .string()
                .describe("The currency pair to get the rate for (e.g., 'BTCUSD', 'ETHUSD', 'BTCEUR')")
        }
    }, async ({ pair }) => {
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
        }
        catch (error) {
            const message = error instanceof UpholdApiError
                ? `Failed to fetch ticker for pair ${pair}: ${error.message}`
                : `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
            return {
                content: [{ type: "text", text: message }],
                isError: true
            };
        }
    });
}
//# sourceMappingURL=tickers.js.map