#!/usr/bin/env node

import { PlainlyMcpServer } from "./server";
import env from "./env";

// Validate required environment variables
if (!env.PLAINLY_API_KEY || !env.PLAINLY_API_URL) {
  console.error(
    "Please set PLAINLY_API_KEY and PLAINLY_API_URL environment variables."
  );
  process.exit(1);
}

const server = new PlainlyMcpServer();
await server.start();
