import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { AxiosInstance } from "axios";
import { PACKAGE_NAME, PACKAGE_VERSION } from "./contants";
import createPlainlyClient, { type PlainlySdk } from "./sdk";
import {
  registerCheckRenderStatus,
  registerGetRenderableItemDetails,
  registerListRenderableItems,
  registerRenderItem,
} from "./tools";

export class PlainlyMcpServer {
  mcpServer: McpServer;

  constructor(private readonly apiClient: AxiosInstance) {
    this.mcpServer = new McpServer({
      name: PACKAGE_NAME,
      version: PACKAGE_VERSION,
    });
    const plainlySdk: PlainlySdk = createPlainlyClient(this.apiClient);

    // Register tools
    registerListRenderableItems(plainlySdk, this.mcpServer);
    registerGetRenderableItemDetails(plainlySdk, this.mcpServer);
    registerRenderItem(plainlySdk, this.mcpServer);
    registerCheckRenderStatus(plainlySdk, this.mcpServer);
  }

  async startStdio() {
    // Start the stdio server
    const transport = new StdioServerTransport();
    await this.mcpServer.connect(transport);
  }
}
