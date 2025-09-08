import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getRenderableItemsDetails } from "../sdk";

export function registerGetRenderableItemDetails(server: McpServer) {
  const Input = {
    renderableItemId: z.string().describe("Project/design id."),
    isDesign: z.boolean().describe("Whether the renderable item is a design."),
  };
  const Output = {
    itemDetails: z
      .array(
        z.object({
          isDesign: z
            .boolean()
            .describe("True if item is a Design; false if a Project."),
          id: z.string().describe("Project/design id."),
          variantId: z
            .string()
            .describe("Template/variant id (renderable leaf)."),
          parameters: z
            .array(
              z.object({
                key: z.string().describe("Parameter key."),
                mandatory: z
                  .boolean()
                  .describe("Whether the parameter is mandatory."),
                type: z
                  .enum([
                    "STRING",
                    "MEDIA",
                    "COLOR",
                    "NUMBER",
                    "BOOLEAN",
                    "COMPLEX",
                  ])
                  .describe("Parameter type."),
                description: z
                  .string()
                  .nullable()
                  .describe(
                    "Use this field to figure out what the parameter is."
                  ),
                label: z
                  .string()
                  .nullable()
                  .describe(
                    "If parameter description does not exist, use label to figure out what the parameter is."
                  ),
              })
            )
            .describe("Parameters needed for rendering."),
        })
      )
      .describe("Renderable items details needed for rendering."),
  };

  server.registerTool(
    "get_renderable_items_details",
    {
      title: "Get Renderable Item Details",
      description: `
Return specific projects/design renderable items along with their parameters needed for successful rendering.

Inputs:
- renderableItemId (boolean, required): Project/design id to get the details for.
- isDesign (boolean, required): Whether the renderable item is a design.

Guidance:
- mandatory fields should be respected when providing parameters for rendering.
- type field indicates the kind of data expected for each parameter.
- use description, label, and name respectively to understand the purpose of each parameter.

Use when:
- To get details for a specific project/design and parameter schema.
- Before creating a render request.

Follow-ups:

- "render_item" - initiate a render with the chosen template/variant and parameters
      `,
      inputSchema: Input,
      outputSchema: Output,
    },
    async ({ renderableItemId, isDesign }) => {
      const itemDetails = await getRenderableItemsDetails(
        renderableItemId,
        isDesign
      );

      return {
        content: [{ type: "text", text: JSON.stringify(itemDetails) }],
        structuredContent: { itemDetails },
      };
    }
  );
}
