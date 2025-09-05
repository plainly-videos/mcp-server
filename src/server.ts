import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerListRenderableItems } from "./tools/listRenderableItems";

export class PlainlyMcpServer {
  server: McpServer;
  transport: StdioServerTransport;

  constructor() {
    this.server = new McpServer({
      name: "plainly-mcp-server",
      version: "1.0.0",
    });
    this.transport = new StdioServerTransport();

    // Register tools
    registerListRenderableItems(this.server);
  }

  async start() {
    // Start the stdio server
    await this.server.connect(this.transport);
  }
}
