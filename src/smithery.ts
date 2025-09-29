import { z } from "zod";
import { PlainlyMcpServer } from "./server";
import env from "./env";
import { createApiClient } from "./axiosConfig";

export default function createServer({
  config,
}: {
  config: z.infer<typeof configSchema>;
}) {
  const apiClient = createApiClient({
    baseUrl: env.PLAINLY_API_URL,
    apiKey: config.apiKey,
  });
  const plainlyServer = new PlainlyMcpServer(apiClient);
  return plainlyServer.mcpServer.server;
}

export const configSchema = z.object({
  apiKey: z.string().describe("Your Plainly API key."),
});
