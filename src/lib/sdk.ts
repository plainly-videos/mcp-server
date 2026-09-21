import { createApiClient } from "../axiosConfig";
import env from "../env";
import createPlainlyClient, { type PlainlySdk } from "../sdk";

let client: PlainlySdk | undefined;

/**
 * Returns the shared Plainly SDK client, creating it on first use.
 *
 * This is resolved lazily rather than at import time: xmcp loads every tool
 * module when the server boots, and throwing there would kill the process
 * before it could report the problem over the protocol.
 */
export function getSdk(): PlainlySdk {
  if (!client) {
    if (!env.PLAINLY_API_KEY) {
      throw new Error("PLAINLY_API_KEY environment variable is required.");
    }

    client = createPlainlyClient(
      createApiClient({
        baseUrl: env.PLAINLY_API_URL,
        apiKey: env.PLAINLY_API_KEY,
      }),
    );
  }

  return client;
}
