#!/usr/bin/env node

import { PlainlyMcpServer } from "./server";
import env from "./env";

// Validate required environment variables
if (!env.PLAINLY_API_KEY) {
  console.error("PLAINLY_API_KEY environment variable is required.");
  process.exit(1);
}

const server = new PlainlyMcpServer();
await server.start();
