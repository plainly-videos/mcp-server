import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { renderItem } from "../sdk";

export function registerRenderItem(server: McpServer) {
  const Input = {
    isDesign: z
      .boolean()
      .describe(
        "True when the parent is a Design; false when it is a Project."
      ),
    projectDesignId: z
      .string()
      .describe("Parent identifier (projectId or designId)."),
    templateVariantId: z
      .string()
      .describe(
        "Template/variant identifier (the renderable leaf under the parent)."
      ),
    parameters: z
      .record(z.any())
      .default({})
      .describe(
        "Key-value parameters required by the chosen template/variant. Mandatory parameters must be provided."
      ),
  };

  const Output = {
    id: z.string().describe("Server-assigned render job ID."),
    state: z
      .enum([
        "PENDING",
        "THROTTLED",
        "QUEUED",
        "IN_PROGRESS",
        "DONE",
        "FAILED",
        "INVALID",
        "CANCELLED",
      ])
      .describe("Current state of the render job."),
    output: z
      .string()
      .nullable()
      .describe("URL to the rendered video, if state is DONE."),
    error: z
      .record(z.any())
      .nullable()
      .describe("Error details, if state is FAILED or INVALID."),
  };

  server.registerTool(
    "render_item",
    {
      title: "Render Item",
      description: `
Create a render for a selected Project template or Design variant.

Use when:
- The user has confirmed a specific template/variant and provided all mandatory parameters.
      `,
      inputSchema: Input,
      outputSchema: Output,
    },
    async ({ isDesign, projectDesignId, templateVariantId, parameters }) => {
      try {
        const render = await renderItem({
          isDesign,
          projectDesignId,
          templateVariantId,
          parameters,
        });

        return {
          content: [
            {
              type: "text",
              text: `Render created successfully with ID: ${render.id}.`,
            },
          ],
          structuredContent: render,
        };
      } catch (err: any) {
        // Handle API errors gracefully
        return {
          content: [
            {
              type: "text",
              text: `Failed to create render: ${err}`,
            },
          ],
          structuredContent: err,
        };
      }
    }
  );
}
