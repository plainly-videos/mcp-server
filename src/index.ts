#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { listProjectsTool } from './tools/list_projects.js';
import { getDesignDetailsTool } from './tools/get_design_details.js';
import { renderDesignTool } from './tools/render_design.js';

const server = new Server(
  {
    name: 'plainly-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [listProjectsTool.definition, getDesignDetailsTool.definition, renderDesignTool.definition],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'list_projects':
      return await listProjectsTool.handler(args || {});
    case 'get_design_details':
      return await getDesignDetailsTool.handler(args || {});
    case 'render_design':
      return await renderDesignTool.handler(args || {});
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Server running on stdio');
}

main().catch((error: Error) => {
  console.error('Server error:', error);
  process.exit(1);
});