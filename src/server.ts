import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  registerListRenderableItems,
  registerGetRenderableItemDetails,
  registerRenderItem,
  registerCheckRenderStatus,
} from "./tools";
import { PACKAGE_NAME, PACKAGE_VERSION } from "./contants";

export class PlainlyMcpServer {
  server: McpServer;
  transport: StdioServerTransport;

  constructor() {
    this.server = new McpServer({
      name: PACKAGE_NAME,
      version: PACKAGE_VERSION,
    });
    this.transport = new StdioServerTransport();

    // Register tools
    registerListRenderableItems(this.server);
    registerGetRenderableItemDetails(this.server);
    registerRenderItem(this.server);
    registerCheckRenderStatus(this.server);
  }

  async start() {
    // Start the stdio server
    await this.server.connect(this.transport);
  }
}
