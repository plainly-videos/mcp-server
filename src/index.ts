#!/usr/bin/env node

import { PlainlyMcpServer } from "./server";
import env from "./env";
import { isValidApiKey } from "./sdk";

// Validate required environment variables
if (!env.PLAINLY_API_KEY) {
  console.error("\nERROR: PLAINLY_API_KEY environment variable is required.\n");
  process.exit(1);
} else {
  // Test API key
  if (!(await isValidApiKey())) {
    console.error("\nERROR: Invalid PLAINLY_API_KEY.\n");
    process.exit(1);
  }
}

const server = new PlainlyMcpServer();
await server.start();
