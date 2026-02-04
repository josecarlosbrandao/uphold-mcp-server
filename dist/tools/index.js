/**
 * Tool Registry
 *
 * Registers all MCP tools with the server.
 */
import { registerTickerTools } from "./tickers";
import { registerAssetsTool } from "./assets";
import { registerCountriesTool } from "./countries";
/**
 * Register all Uphold API tools with the MCP server
 */
export function registerAllTools(server) {
    // Register ticker tools (3 tools)
    registerTickerTools(server);
    // Register assets tool (1 tool)
    registerAssetsTool(server);
    // Register countries tool (1 tool)
    registerCountriesTool(server);
}
//# sourceMappingURL=index.js.map