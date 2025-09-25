import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  registerListRenderableItems,
  registerGetRenderableItemDetails,
  registerRenderItem,
  registerCheckRenderStatus,
} from "./tools";
import { PACKAGE_NAME, PACKAGE_VERSION } from "./contants";
import { AxiosInstance } from "axios";
import createPlainlyClient, { PlainlySdk } from "./sdk";

export class PlainlyMcpServer {
  server: McpServer;
  transport: StdioServerTransport;

  constructor(private readonly apiClient: AxiosInstance) {
    this.server = new McpServer({
      name: PACKAGE_NAME,
      version: PACKAGE_VERSION,
    });
    this.transport = new StdioServerTransport();
    const plainlySdk: PlainlySdk = createPlainlyClient(this.apiClient);

    // Register tools
    registerListRenderableItems(plainlySdk, this.server);
    registerGetRenderableItemDetails(plainlySdk, this.server);
    registerRenderItem(plainlySdk, this.server);
    registerCheckRenderStatus(plainlySdk, this.server);
  }

  async start() {
    // Start the stdio server
    await this.server.connect(this.transport);
  }
}
