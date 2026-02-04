/**
 * Assets Tool
 *
 * MCP tool for fetching supported assets from Uphold's public API.
 */
import { upholdClient, UpholdApiError } from "../api/client";
/**
 * Register the assets tool with the MCP server
 */
export function registerAssetsTool(server) {
    server.registerTool("get-assets", {
        description: "Get all supported assets on Uphold. Returns a list of all cryptocurrencies and fiat currencies available for trading, including their codes, names, status, and type."
    }, async () => {
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
        }
        catch (error) {
            const message = error instanceof UpholdApiError
                ? `Failed to fetch assets: ${error.message}`
                : `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
            return {
                content: [{ type: "text", text: message }],
                isError: true
            };
        }
    });
}
//# sourceMappingURL=assets.js.map