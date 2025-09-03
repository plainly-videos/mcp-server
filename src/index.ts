import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerListRenderableItems } from "./tools/listRenderableItems";

// Create an MCP server
const server = new McpServer({
  name: "plainly-mcp-server",
  version: "1.0.0",
});

// Register tools
registerListRenderableItems(server);

// Start the stdio server
const transport = new StdioServerTransport();
await server.connect(transport);
