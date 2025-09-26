#!/usr/bin/env node

import { PlainlyMcpServer } from "./server";
import env from "./env";
import { createApiClient } from "./axiosConfig";

// Validate required environment variables
if (!env.PLAINLY_API_KEY) {
  console.error("\nERROR: PLAINLY_API_KEY environment variable is required.\n");
  process.exit(1);
}

const apiClient = createApiClient({
  baseUrl: env.PLAINLY_API_URL,
  apiKey: env.PLAINLY_API_KEY,
});
const server = new PlainlyMcpServer(apiClient);
await server.startStdio();
